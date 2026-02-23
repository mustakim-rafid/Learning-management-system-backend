import httpStatus from "http-status"
import { AppError } from "../../utils/AppError";
import { UserJwtPayload } from "../../types";
import { prisma } from "../../helpers/prisma";
import { EnrollmentStatus, PaymentStatus } from "../../generated/prisma/enums";
import { stripe } from "../../helpers/stripe";
import config from "../../config";
import Stripe from "stripe";
import { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import { IPaginationParameters, normalizePaginationQueryParams } from "../../helpers/normalizeQueryParams";

type EnrollResult =
  | { enrollment: any; payment?: null }
  | { enrollment: any; payment: any };

export const enrollStudent = async (
  courseId: string,
  user: UserJwtPayload
): Promise<EnrollResult> => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  if (course.deletedAt) throw new AppError(httpStatus.NOT_FOUND, "Course not available");
  if (course.status !== "PUBLISHED") throw new AppError(httpStatus.FORBIDDEN, "Course not published");

  const currentUser = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      role: user.role
    }
  })

  if (course.instructorId === currentUser.id) throw new AppError(httpStatus.NOT_FOUND, "Cannot enroll in your own course");

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: currentUser.id, courseId } } as any,
  });
  if (existing) throw new AppError(httpStatus.NOT_FOUND, "Already enrolled");

  if (!course.isPaid) {
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: currentUser.id,
        courseId,
        status: "ACTIVE",
        progress: 0,
      },
    });
    return { enrollment, payment: null };
  }

  return await prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.create({
      data: {
        studentId: currentUser.id,
        courseId,
        status: "ACTIVE", 
        progress: 0,
      },
    });

    const payment = await tx.payment.create({
      data: {
        enrollmentId: enrollment.id,
        amount: course.price,
        provider: null,
        providerPaymentId: null,
        status: "PENDING",
      },
    });

    return { enrollment, payment };
  });
};

export const enrollmentPayment = async (
  enrollmentId: string,
  user: UserJwtPayload
) => {
  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: {
      id: enrollmentId,
      student: {
        email: user.email,
      },
      status: EnrollmentStatus.DROPPED,
    },
    include: {
      course: true,
      student: true,
      payment: true,
    },
  });

  if (!enrollment.payment) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment record not found");
  }

  if (enrollment.payment.status === PaymentStatus.SUCCESS) {
    throw new AppError(httpStatus.BAD_REQUEST, "Already paid");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: enrollment.student.email,
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Course: ${enrollment.course.title}`,
          },
          unit_amount: enrollment.course.price * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      enrollmentId,
      paymentId: enrollment.payment.id,
    },
    mode: "payment",
    success_url: `${config.frontend_url}/dashboard/my-courses`,
    cancel_url: `${config.frontend_url}/courses/${enrollment.course.slug}`,
  });

  return {
    paymentUrl: session.url,
  };
};

export const paymentVerification = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.stripe_webhook_secret as string
    );
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const enrollmentId = session.metadata?.enrollmentId;
    const paymentId = session.metadata?.paymentId;

    if (!enrollmentId || !paymentId) {
      return res.status(400).send("Invalid metadata");
    }

    await prisma.enrollment.update({
      where: {
        id: enrollmentId,
      },
      data: {
        status: EnrollmentStatus.ACTIVE,
      },
    });

    await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: PaymentStatus.SUCCESS,
        paymentGatewayData: session as any,
      },
    });
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const paymentId = session.metadata?.paymentId;

    if (paymentId) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.FAILED,
          paymentGatewayData: session as any,
        },
      });
    }
  }

  return res.status(200).json({ received: true });
};

export const getEnrollmentsByCourse = async (
  courseId: string,
  paginations: Partial<IPaginationParameters>,
  filters: any
) => {
  const { take, skip, page, sortOrder, sortBy } =
    normalizePaginationQueryParams(paginations);

  const { searchTerm } = filters;

  const andConditions: Prisma.EnrollmentWhereInput[] = [
    {
      courseId: {
        equals: courseId,
      },
    },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          student: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          student: {
            email: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.enrollment.findMany({
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder,
    },
    where: whereConditions,
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payment: true,
    },
  });

  const total = await prisma.enrollment.count({
    where: whereConditions,
  });

  return {
    meta: {
      limit: take,
      page,
      total,
    },
    data: result,
  };
};

// - markLessonCompleted: Student marks a lesson complete.
// - creates LessonCompletion if not exists
// - recalculates progress = completedLessons / totalLessons * 100
// - if progress === 100 => mark enrollment COMPLETED and set completedAt
export const markLessonCompleted = async (
  lessonId: string,
  user: UserJwtPayload
) => {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new Error("Lesson not found");

  const course = await prisma.course.findUnique({ where: { id: lesson.courseId } });
  if (!course) throw new Error("Course not found");
  if (course.deletedAt) throw new Error("Course not available");
  if (course.status !== "PUBLISHED") throw new Error("Course not published");

  const currentUser = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      role: user.role
    }
  })

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: currentUser.id, courseId: course.id } } as any,
    include: { payment: true },
  });
  if (!enrollment) throw new Error("Not enrolled");
  if (course.isPaid) {
    const payment = enrollment.payment;
    if (!payment || payment.status !== "SUCCESS") throw new Error("Payment required to access content");
  }

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.lessonCompletion.findUnique({
      where: { lessonId_studentId: { lessonId, studentId: currentUser.id } } as any,
    });
    if (!existing) {
      await tx.lessonCompletion.create({
        data: {
          lessonId,
          studentId: currentUser.id,
        },
      });
    }

    const totalLessons = await tx.lesson.count({ where: { courseId: course.id } });
    const completedLessons = await tx.lessonCompletion.count({
      where: { studentId: currentUser.id, lesson: { courseId: course.id } },
    });

    const progress = totalLessons === 0 ? 0 : (completedLessons / totalLessons) * 100;

    const progressRounded = Math.min(100, Math.round(progress * 100) / 100);

    const updateData: any = { progress: progressRounded };
    if (progressRounded >= 100) {
      updateData.status = "COMPLETED";
      updateData.completedAt = new Date();
    }

    const updatedEnrollment = await tx.enrollment.update({
      where: { id: enrollment.id },
      data: updateData,
    });

    return { success: true, enrollment: updatedEnrollment, completedLessons, totalLessons };
  });
};

export const getStudentCourses = async (studentId: string) => {
  const items = await prisma.enrollment.findMany({
    where: { studentId },
    include: { course: { include: { instructor: { select: { id: true, name: true } } } }, payment: true },
    orderBy: { enrolledAt: "desc" },
  });
  return items
};

export const enrollmentServices = {
  enrollStudent,
  enrollmentPayment,
  paymentVerification,
  getEnrollmentsByCourse,
  markLessonCompleted,
  getStudentCourses
}