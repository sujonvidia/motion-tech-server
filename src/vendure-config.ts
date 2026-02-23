import { compileUiExtensions } from '@vendure/ui-devkit/compiler';
import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    VendureConfig,
    configureDefaultOrderProcess,
    DefaultGuestCheckoutStrategy,
    NoopSessionCacheStrategy  
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import 'dotenv/config';
import path from 'path';
import { LandingPagePlugin } from './plugins/landing-page/landing-page.plugin';
import { FacebookPixelPlugin } from './plugins/facebook-pixel/facebook-pixel.plugin';
import { MultivendorPlugin } from './plugins/multivendor-plugin/multivendor.plugin';
// import { PaymentExtensionsPlugin } from '@pinelab/vendure-plugin-payment-extensions';

import express from 'express';
import bodyParser from 'body-parser';
import { INestApplication } from '@nestjs/common';

const IS_DEV = process.env.APP_ENV === 'dev';
const landingUiExtensionPath = path.join(__dirname, 'plugins/landing-page/ui');

const myCustomOrderProcess = configureDefaultOrderProcess({
    // Disable the constraint that requires
    // Orders to have a shipping method assigned
    // before payment.
    arrangingPaymentRequiresShipping: false,
    checkModificationPayments: false,
    checkAdditionalPaymentsAmount: false,
    checkAllVariantsExist: false,
    arrangingPaymentRequiresContents: false,
    arrangingPaymentRequiresCustomer: false,
    arrangingPaymentRequiresStock: false,
    checkPaymentsCoverTotal: false,
    checkAllItemsBeforeCancel: false,
    checkFulfillmentStates: false,
  });

export const config: VendureConfig = {
    apiOptions: {
        port: Number(process.env.PORT) || 3000,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        // The following options are useful in development mode,
        // but are best turned off for production for security
        // reasons.
        ...(IS_DEV ? {
            adminApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            adminApiDebug: true,
            shopApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            shopApiDebug: true,
            middlewareFn: (app: INestApplication) => {
                const expressApp = app.getHttpAdapter().getInstance() as express.Express;
                
                expressApp.use(bodyParser.json({ limit: '100mb' })); // Increase limit if needed
                expressApp.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
            
                // Also configure in Vendure's built-in middleware
                expressApp.use((req, res, next) => {
                    res.setHeader('Access-Control-Allow-Origin', '*'); // Optional: CORS
                    next();
                });
            },
        } : {}),
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME,
            password: process.env.SUPERADMIN_PASSWORD,
        },
        cookieOptions: {
          secret: process.env.COOKIE_SECRET,
        },
        // requireVerification: false,
        // sessionCacheStrategy: new NoopSessionCacheStrategy(),
    },
    dbConnectionOptions: {
        type: 'postgres',
        // See the README.md "Migrations" section for an explanation of
        // the `synchronize` and `migrations` options.
        synchronize: true,
        // migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        database: process.env.DB_NAME,
        schema: process.env.DB_SCHEMA,
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    },
    orderOptions: {
        process: [myCustomOrderProcess],
        guestCheckoutStrategy: new DefaultGuestCheckoutStrategy({
            allowGuestCheckouts: true, // Enable guest checkout
            allowGuestCheckoutForRegisteredCustomers: true, // Prevent registered customers from checking out as guests
        }),
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    // When adding or altering custom field definitions, the database will
    // need to be updated. See the "Migrations" section in README.md.
    customFields: {
        Product: [
            {
                name: 'landing',
                type: 'text', // Use 'string' to store rich text content
                ui: { component: 'landing-form-input' },
                public: true
            },
        ],
    },
    plugins: [
        MultivendorPlugin.init({
            platformFeePercent: 10,
            platformFeeSKU: 'FEE',
        }),
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            // For local dev, the correct value for assetUrlPrefix should
            // be guessed correctly, but for production it will usually need
            // to be set manually to match your production url.
            assetUrlPrefix: IS_DEV ? undefined : 'https://www.my-shop.com/assets/',
        }),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        EmailPlugin.init({
            devMode: true,
            outputPath: path.join(__dirname, '../static/email/test-emails'),
            route: 'mailbox',
            handlers: defaultEmailHandlers,
            templatePath: path.join(__dirname, '../static/email/templates'),
            globalTemplateVars: {
                // The following variables will change depending on your storefront implementation.
                // Here we are assuming a storefront running at http://localhost:8080.
                fromAddress: '"example" <noreply@example.com>',
                verifyEmailAddressUrl: 'http://localhost:8080/verify',
                passwordResetUrl: 'http://localhost:8080/password-reset',
                changeEmailAddressUrl: 'http://localhost:8080/verify-email-address-change'
            },
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: 3002,
            adminUiConfig: {
                apiPort: Number(process.env.PORT) || 3000,
            },
            ...(IS_DEV
                ? {
                      app: compileUiExtensions({
                          outputPath: path.join(__dirname, '../admin-ui'),
                          extensions: [
                              {
                                  id: 'common',
                                  extensionPath: landingUiExtensionPath,
                                  providers: ['providers.ts'],
                              },
                          ],
                      }),
                  }
                : {}),
        }),
        LandingPagePlugin.init({}),
        FacebookPixelPlugin.init({}),
        // PaymentExtensionsPlugin
    ],
};
