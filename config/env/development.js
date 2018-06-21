/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMongodbServer'
  // }
  hookTimeout: 40000,
  models: {
    connection: 'localMongodbServer'
  },
  DOMAIN: "http://localhost:1337",
  ACCOUNT_KIT: {
    APP_ID: '1622052791178463',
    APP_SECRET: 'b625e8f05201385d67ac89c30590c5c6',
    VERSION: 'v1.0'
  },
  VNPAY: {
    "vnp_TmnCode": "HOMICR01",
    "vnp_HashSecret": "CJCDFQTQEZYBRZMRLBKNIHWYNBYJEWCT",
    "vnp_Url": "http://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    "vnp_ReturnUrl": "http://localhost:1337/vnp/orderReturn",

  },
  CUSTOMER_PENALTY_CANCEL: 50000,
  PARTNER_PENALTY_CANCEL: 50000,
  BRUTE_FORCE: 4,
  SMS_USERNAME: "sms_backend",
  SMS_PASSWORD: "Neon123456@",
  SMS_CPCODE: "VIECNHANHAH",
  GOOGLE_API_KEY: "AIzaSyAprYDo7S9Lokb_iNROoE-Q_q6nrp8xmVs",
  SERVER_ID: "MASTER",
  PAYPLUS_HOST: "http://service.payplus.com.vn",
  PAYPLUS_BASIC_TOKEN: "Basic 8xjbZx1zo8D0AkX6V2zxuoMxG6XPGSTC",
  STATIC: "http://static.viecnhanhanh.vn/",
  INVITE_CODE_EXPIRE: 604800, //seconds
  TOKEN_EXPIRE: 86400, //seconds
  INVITE_CODE_GIFT: 100000, //VND
  INTRODUCTION_SITE: 'http://viecnhanhanh.vn',
  OTP_EXPIRE: 300,
  "FIREBASE_PARTNER": "AAAAPIwZLlQ:APA91bFMWSACIJo4xq7fjX-NxdwiqneLjw8ppk7WCQ-Zby5CXcdldTubqmYICxG4ukj45n824mDtdG9H890WDgQyJ9WSu4J4oS_jjrFGwQohdViejSM1bcfTx-ilnzN6ovZULTJ29Wn8",
  "FIREBASE_CUSTOMER": "AAAA6d-3-nM:APA91bFOdQ6ohmj-VN_ufomtIDzqMdgVT5KEK0zatYhwmhh3dm9_4QJJzIG-aojGTrZ87JlENrDh2g1BtvJjovuAg8O6O1xgtqx7kD5-ogpIsiNYO6Zsqj1CKjQ3rI6Xy1y1KiZzQJOB",
  PARTNER_ACCEPT_TIMEOUT: 30000,
  PARTNER_RETRIES_TIME: 5000,
  PARTNER_REMIND_FIRST: 30,
  ORDER_PENDING_EXPIRE_TIME: 7200, //second
  PARTNER_REMIND_SECOND: 10,
  ORDER_PROCESS_TIMEOUT: 3600,
  FIND_PARTNER_RETRIES: 3,
  PAYPLUS_SECRET: "8ab9ba27-7b93-457d-a327-db8522ea9882",
  MIN_BALANCE_PUSH_JOB: 50000,
  MAIL: {
    USERNAME: "tungdo@neonstudio.us",
    PASSWORD: "tung123",
    MAIL_FROM: "cskh@neonstudio.us",
    TEMPLATE_FORGOTPASSWORD: "views/mail/forgotPassword.pug"
  },
  ACCOUNT: {
    CASH: '59a511bd4fccf7b829ebaf85',
    BANK: '59a633a882d2c9095c2ff043',
    PAYABLE: '59a511bd4fccf7b829ebaf86',
    INCOME: '59a511bd4fccf7b829ebaf87',
    EXTERNAL: '59a513eb82d2c92f2c2d01c4',
    TEMP: '59c1c040e121ffc8338d4b40'
  },
  PUSH_FLAG: {
    CUSTOMER: {
      PARTNER_FOUND: 1,
      PARTNER_NOTFOUND: 2,
      REMIND_START_TIME: 3,
      PARTNER_FINISH_JOB: 4,
      PARTNER_CANCEL_JOB: 5,
      REMIND_CONFIRM_PAY: 6,
      PARTNER_START_JOB: 7
    },
    PARTNER: {
      NEW_JOB: 1,
      REMIND_START_TIME: 2,
      CUSTOMER_CANCEL_JOB: 3,
      REMIND_END_TIME: 4
    }
  },
  PARTNER_QUEUE: {
    SLEEPING_TIME: 5000
  },
  ORDER_STATUS: {
    CREATE: 1,
    FINDING_PARTNER: 2,
    TIMEOUT: 3,
    DENIED: 4,
    PARTNER_ACCEPT: 5,
    STARTED: 6,
    PARTNER_CANCEL: 7,
    FINISHED: 8,
    CUSTOMER_CANCEL: 9,
    CANNOT_FIND_PARTNER: 10,
    FINISH_WITH_RATE: 11,
    PENDING: 12
  },
  MAIL: {
    URL: 'https://mailalchemy.com/cms',
    SUBJECT: 'VIỆC NHÀ NHANH',
    MAILFROM: 'contact.viecnhanhanh@gmail.com',
    USERSENDER: 'VIỆC NHÀ NHANH',
    SECRETKEY: '8b6aead0-a266-4c1f-ac0f-b97ddd21121b'
  }
};
