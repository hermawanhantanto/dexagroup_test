-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NULL,
    `date_of_birth` DATE NULL,
    `gender` ENUM('MALE', 'FEMALE') NULL,
    `role` ENUM('EMPLOYEE', 'HR_ADMIN') NOT NULL DEFAULT 'EMPLOYEE',
    `salary` DECIMAL(12, 2) NULL,
    `join_date` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendances` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `attendance_date` DATE NOT NULL,
    `work_type` ENUM('WFO', 'WFH') NULL,
    `clock_in_at` DATETIME(3) NULL,
    `clock_out_at` DATETIME(3) NULL,
    `proof_image_url` TEXT NULL,
    `notes` TEXT NULL,
    `status` ENUM('PRESENT', 'SICK', 'LEAVE', 'ABSENT') NOT NULL DEFAULT 'PRESENT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `attendances_user_id_attendance_date_key`(`user_id`, `attendance_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
