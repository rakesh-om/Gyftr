-- CreateTable
CREATE TABLE `Setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mid` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NULL,
    `accessToken` VARCHAR(191) NULL,
    `shop` VARCHAR(191) NOT NULL,
    `brand_name` VARCHAR(191) NOT NULL,
    `enc_dec_api_iv_key` VARCHAR(191) NOT NULL,
    `enc_dec_api_key` VARCHAR(191) NOT NULL,
    `hash_salt` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `reverse_salt` VARCHAR(191) NOT NULL,
    `shopid` BIGINT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Balance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(255) NOT NULL,
    `balance` FLOAT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cartdetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `total` VARCHAR(100) NULL,
    `porderid` VARCHAR(100) NULL,
    `shopid` VARCHAR(255) NULL,
    `tid` VARCHAR(100) NULL,
    `mid` VARCHAR(100) NULL,
    `baseUrl` VARCHAR(100) NULL,
    `CouponCode` VARCHAR(100) NULL,
    `status` VARCHAR(100) NULL,
    `mobile` VARCHAR(100) NULL,
    `callback_received` BOOLEAN NULL DEFAULT false,
    `Remark` VARCHAR(255) NULL,
    `Refund_Status` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GyftrRedemptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL,
    `shopify_order_id` BIGINT NULL,
    `gytr_order_id` VARCHAR(255) NULL,
    `coupon_code` VARCHAR(100) NULL,
    `coupon_id` VARCHAR(100) NULL,
    `amount` VARCHAR(100) NULL,
    `mid` VARCHAR(100) NULL,
    `requestid` VARCHAR(100) NULL,
    `redeemed_at` DATETIME(0) NULL,
    `refunded` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Refund` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shop_order_id` VARCHAR(100) NULL,
    `item_total` INTEGER NULL,
    `refund_webhook_req` LONGTEXT NULL,
    `order_txn_id` VARCHAR(100) NULL,
    `refund_amount` VARCHAR(100) NULL,
    `refund_txn_id` VARCHAR(100) NULL,
    `shop_name` VARCHAR(100) NULL,
    `shop_id` VARCHAR(100) NULL,
    `refunded` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Webhook` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `webhookreq` TEXT NULL,
    `shop_name` VARCHAR(100) NULL,
    `shop_id` VARCHAR(100) NULL,
    `coupon_code` VARCHAR(255) NULL,
    `use_gyftr` VARCHAR(255) NULL,
    `order_id` BIGINT NULL,
    `update_attribute` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shopify_sessions` (
    `id` VARCHAR(255) NOT NULL,
    `shop` VARCHAR(255) NOT NULL,
    `state` VARCHAR(255) NOT NULL,
    `isOnline` TINYINT NOT NULL,
    `scope` VARCHAR(1024) NULL,
    `expires` INTEGER NULL,
    `onlineAccessInfo` VARCHAR(255) NULL,
    `accessToken` VARCHAR(255) NULL,
    `onboarded` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `shopify_sessions_shop_key`(`shop`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shopify_sessions_migrations` (
    `migration_name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`migration_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
