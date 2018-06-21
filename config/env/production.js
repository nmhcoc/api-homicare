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
  hookTimeout: 40000,
  models: {
    connection: 'productionMongodbServer'
  },
  VNPAY: {
    "vnp_TmnCode": "HOMICR01",
    "vnp_HashSecret": "CJCDFQTQEZYBRZMRLBKNIHWYNBYJEWCT",
    "vnp_Url": "http://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    "vnp_ReturnUrl": "http://api.homicare.vn/vnp/orderReturn",
  },
  port: 8254,
  SERVER_ID: "MASTER",
  "FIREBASE_PARTNER": "AAAAu5PEgCU:APA91bFAXPsgpLcqq47cihP-5dXu0ydMBwbjN0Pctx5NxZtdlA9JOsrkZ8YH9DoS9u11FIIBSosksH77LpPcLFgTMnNgWBcyujuXziCdBclRdsRtEBoSmp6AzljlSH_0-8mpH0RO8LQh",
  "FIREBASE_CUSTOMER": "AAAA9EPM368:APA91bHDUBXBJxT-IdSOwjYGbLUJEK7YcpQC5mePuk8_lzqD4yh7S-KmOu96nS9nFDbSnbgUX8wCRVp7vMrTJj2YrLnmx4qPXQXlofndusHYU_s50ALKABrWdAnpKy4DmhQUqbF7IJJo",
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
    URL: 'https://mailalchemy.com/cms',
    SUBJECT: 'VIỆC NHÀ NHANH',
    MAILFROM: 'contact.viecnhanhanh@gmail.com',
    USERSENDER: 'VIỆC NHÀ NHANH',
    SECRETKEY: '638cf185-f5c6-4a59-bcd7-3dc10a6a1104'
  }
};
