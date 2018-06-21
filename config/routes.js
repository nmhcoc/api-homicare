/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'homepage'
  },

  //combo order
  'post /comboorder/order': 'ComboOrderController.order',
  'post /comboorder/find': 'ComboOrderController.find',

  //image
  'post /image/upload': 'ImageController.upload',
  //combo pricing
  'post /combopricing/find': 'ComboPricingController.find',
  'post /combopricing/update': 'ComboPricingController.update',
  'post /combopricing/delete': 'ComboPricingController.delete',
  'post /combopricing/create': 'ComboPricingController.create',

  //combo
  'post /combo/find': 'ComboController.find',
  'post /combo/update': 'ComboController.update',
  'post /combo/delete': 'ComboController.delete',
  'post /combo/create': 'ComboController.create',
  //faq
  'post /faq/find': 'FaqController.find',
  'post /faq/update': 'FaqController.update',
  'post /faq/delete': 'FaqController.delete',
  'post /faq/create': 'FaqController.create',
  //agency
  'post /agency/findPartners': 'AgencyController.findPartners',
  'post /agency/findOrders': 'AgencyController.findOrders',
  'post /agency/find': 'AgencyController.find',
  'post /agency/create': 'AgencyController.create',
  'post /agency/update': 'AgencyController.update',
  'post /agency/delete': 'AgencyController.delete',
  //contact
  'post /notification/find': 'NotificationController.find',
  'post /notification/toggleRead': 'NotificationController.toggleRead',
  'post /notification/findOne': 'NotificationController.findOne',
  'post /notification/delete': 'NotificationController.delete',
  //contact
  'post /contact/getListContacts': 'ContactController.getListContacts',
  //loyalty level
  'post /loyaltyLevel/findUpdate': 'LoyaltyLevelController.findUpdate',
  'post /loyaltyLevel/findCache': 'LoyaltyLevelController.findCache',
  'post /loyaltyLevel/getNextRank': 'LoyaltyLevelController.getNextRank',
  'post /loyaltyLevel/create': 'LoyaltyLevelController.create',
  'post /loyaltyLevel/update': 'LoyaltyLevelController.update',
  'post /loyaltyLevel/delete': 'LoyaltyLevelController.delete',

  //point history
  'post /pointHistory/find': 'PointHistoryController.find',

  //area
  'post /area/find': 'AreaController.find',
  'post /area/create': 'AreaController.create',
  'post /area/delete': 'AreaController.delete',
  'post /area/update': 'AreaController.update',
  //loyalty
  'post /loyalty/myPromotions': 'LoyaltyController.myPromotions',
  'post /loyalty/getCode': 'LoyaltyController.getCode',
  'post /loyalty/comment': 'LoyaltyController.comment',
  'post /loyalty/rate': 'LoyaltyController.rate',
  //task
  'post /task/find': 'TaskController.find',
  'post /task/update': 'TaskController.update',
  'post /task/start': 'TaskController.start',
  'post /task/stop': 'TaskController.stop',
  'post /task/create': 'TaskController.create',
  'post /task/delete': 'TaskController.delete',


  //crashReport
  'post /crashReport/addCrashReport': 'CrashReportController.addCrashReport',

  //conf
  'post /conf/findConfigs': 'ConfController.findConfigs',
  'post /conf/createConfig': 'ConfController.createConfig',
  'post /conf/editConfig': 'ConfController.editConfig',
  'post /conf/deleteConfig': 'ConfController.deleteConfig',
  //journal
  'post /journal/findJournalEntries': 'JournalController.findJournalEntries',
  'get /journal/findJournalEntries': 'JournalController.findJournalEntries',
  //jobmeta
  'post /jobmeta/findJobMetas': 'JobMetaController.findJobMetas',
  'post /jobmeta/createJobMeta': 'JobMetaController.createJobMeta',
  'post /jobmeta/deleteJobMeta': 'JobMetaController.deleteJobMeta',
  'post /jobmeta/editJobMeta': 'JobMetaController.editJobMeta',


  //menu
  'post /menu/findMenus': 'MenuController.findMenus',
  'post /menu/addMenu': 'MenuController.addMenu',
  'post /menu/deleteMenu': 'MenuController.deleteMenu',
  'post /menu/editMenu': 'MenuController.editMenu',
  'post /menu/findOwnMenus': 'MenuController.findOwnMenus',

  //comment
  'post /comment/userCreateComment': 'CommentController.userCreateComment',
  'post /comment/userGetComments': 'CommentController.userGetComments',
  'post /comment/officerDeleteComment': 'CommentController.officerDeleteComment',
  'post /comment/officerGetComments': 'CommentController.officerGetComments',
  // 'post /comment/officerToggleComment': 'CommentController.officerToggleComment',


  'post /report/getLandingPageReport': 'ReportController.getLandingPageReport',
  //officer

  'post /officer/updateUserProfile': 'OfficerController.updateUserProfile',
  'post /officer/officerAddUserRole': 'OfficerController.officerAddUserRole',
  'post /officer/officerRemoveUserRole': 'OfficerController.officerRemoveUserRole',
  'post /officer/resetCache': 'OfficerController.resetCache',
  // 'post /officer/logout': 'OfficerController.logout',
  // 'post /officer/logout': 'OfficerController.logout',


  'post /officer/logout': 'OfficerController.logout',
  'post /officer/adminFindOfficers': 'OfficerController.adminFindOfficers',
  'post /officer/addUserRoleToUser': 'OfficerController.addUserRoleToUser',
  'post /officer/removeUserRoleFromUser': 'OfficerController.removeUserRoleFromUser',
  'post /officer/createOfficer': 'OfficerController.createOfficer',

  //invite code
  'post /invitecode/createInviteCode': 'InviteCodeController.createInviteCode',

  //post


  'post /post/adminCreatePost': 'PostController.adminCreatePost',
  'post /post/adminEditPost': 'PostController.adminEditPost',
  'post /post/findPosts': 'PostController.findPosts',
  'post /post/adminDeletePost': 'PostController.adminDeletePost',

  //partner queue
  'post /partnerQueue/partnerRegisterQueue': 'PartnerQueueController.partnerRegisterQueue',
  'post /partnerQueue/get': 'PartnerQueueController.get',
  //promotion

  'post /promotion/findPromotions': 'PromotionController.findPromotions',
  'post /promotion/adminCreatePromotion': 'PromotionController.adminCreatePromotion',
  'post /promotion/adminFindPromotions': 'PromotionController.adminFindPromotions',
  'post /promotion/adminDeletePromotion': 'PromotionController.adminDeletePromotion',

  //dev

  'post /dev/createBaseAccount': 'DevController.createBaseAccount',
  //order





  'post /order/customerPayByCard': 'OrderController.customerPayByCard',
  'post /order/pricing': 'OrderController.pricing',
  'post /order/customerReportOrder': 'OrderController.customerReportOrder',
  'post /order/partnerStartOrder': 'OrderController.partnerStartOrder',
  'post /order/customerRateOrder': 'OrderController.customerRateOrder',

  //transaction
  'post /transaction/userFindTransactions': 'TransactionController.userFindTransactions',
  'post /transaction/adminFindTransactions': 'TransactionController.adminFindTransactions',
  //user role

  'post /userrole/findRoles': 'UserRoleController.findRoles',
  'post /userrole/createRole': 'UserRoleController.createRole',
  'post /userrole/deleteRole': 'UserRoleController.deleteRole',
  'post /userrole/updateRoleMenus': 'UserRoleController.updateRoleMenus',
  'post /userrole/updateRolePermissions': 'UserRoleController.updateRolePermissions',
  'post /userrole/findPermissions': 'UserRoleController.findPermissions',

  //dev

  'post /account/cashOut': 'AccountController.cashOut',
  'post /account/cashIn': 'AccountController.cashIn',
  'post /account/adminChargeUser': 'AccountController.cashIn',

  //customer
  'post /customer/deleteAllInfo': 'CustomerController.deleteAllInfo',
  'post /customer/adminCreateCustomer': 'CustomerController.adminCreateCustomer',
  'post /customer/adminFindCustomers': 'CustomerController.adminFindCustomers',

  //user
  'post /user/adminResetPassword': 'UserController.adminResetPassword',
  'post /partner/countOrder': 'PartnerController.countOrder',
  'post /partner/adminFindPartners': 'PartnerController.adminFindPartners',
  'post /user/register': 'UserController.register',
  'post /user/login': 'UserController.login',
  'post /user/refreshToken': 'UserController.refreshToken',
  'post /user/profile': 'UserController.profile',
  'post /user/updateProfile': 'UserController.updateProfile',
  'post /user/uploadAvatar': 'UserController.uploadAvatar',
  'post /user/changePassword': 'UserController.changePassword',
  'post /user/keepAlived': 'PartnerController.keepAlived',
  'post /user/forgotPassword': 'UserController.forgotPassword',
  'post /user/isUserExist': 'UserController.isUserExist',
  'post /user/logout': 'UserController.logout',

  //customer
  'post /customer/createOrder': 'OrderController.customerCreateOrder',
  'post /customer/orderService': 'ServiceController.customerOrderService',
  'post /customer/findOrders': 'OrderController.customerFindOrders',
  'post /customer/cancelOrder': 'OrderController.customerCancelOrder',
  'post /customer/suggestAll': 'CustomerController.suggestAll',
  'post /customer/becomePartner': 'CustomerController.becomePartner',
  'post /customer/findNearbyPartners': 'CustomerController.findNearbyPartners',


  //card
  'get /card/getCardForm': 'CardController.getCardForm',
  'post /card/paymentReturn': 'CardController.paymentReturn',
  'post /card/decodeIPN': 'CardController.decodeIPN',

  //ipn
  'post /ipn/listen': 'IpnController.listen',

  //payment

  'post /payment/findCards': 'CardController.findCards',
  'post /payment/setDefaultMethod': 'UserController.setDefaultMethod',

  //company
  'post /admin/adminFindCompanies': 'CompanyController.adminFindCompanies',
  'post /admin/adminEditCompany': 'CompanyController.adminEditCompany',
  'post /admin/adminCreateCompany': 'CompanyController.adminCreateCompany',
  'post /admin/adminDeleteCompany': 'CompanyController.adminDeleteCompany',
  //report
  'post /report/adminGetDashboardReport': 'ReportController.adminGetDashboardReport',


  'post /vnpIpn/listen': 'VnpIpnController.listen',
  'get /vnpIpn/listen': 'VnpIpnController.listen',
  //vnpay
  'post /vnp/payOrder': 'VnpController.payOrder',
  'get /vnp/orderReturn': 'VnpController.orderReturn',


  //expert order
  'post /expertOrder/customerCreateExpertOrder': 'ExpertOrderController.customerCreateExpertOrder',
  'post /expertOrder/customerFindExpertOrders': 'ExpertOrderController.customerFindExpertOrders',
  'post /expertOrder/officerFindExpertOrders': 'ExpertOrderController.officerFindExpertOrders',
  'post /expertOrder/officerLockExpertOrder': 'ExpertOrderController.officerLockExpertOrder',
  'post /expertOrder/officerUnlockExpertOrder': 'ExpertOrderController.officerUnlockExpertOrder',
  'post /expertOrder/officerBookExpertOrder': 'ExpertOrderController.officerBookExpertOrder',

  //experts
  'post /expert/findExperts': 'ExpertController.findExperts',
  'post /expert/adminDeleteExpert': 'ExpertController.adminDeleteExpert',
  'post /expert/adminCreateExpert': 'ExpertController.adminCreateExpert',
  'post /expert/adminEditExpert': 'ExpertController.adminEditExpert',
  //long order
  'post /longorder/customerCreateLongOrder': 'LongOrderController.customerCreateLongOrder',
  'post /longorder/customerFindLongOrders': 'LongOrderController.customerFindLongOrders',
  'post /longorder/officerFindLongOrders': 'LongOrderController.officerFindLongOrders',
  'post /longorder/officerProcessLongOrder': 'LongOrderController.officerProcessLongOrder',
  'post /longorder/officerLockLongOrder': 'LongOrderController.officerLockLongOrder',
  'post /longorder/officerUnLockLongOrder': 'LongOrderController.officerUnLockLongOrder',

  //partner

  'post /partner/deleteAllInfo': 'PartnerController.deleteAllInfo',
  'post /partner/adminUpdatePartnerInfo': 'PartnerController.adminUpdatePartnerInfo',
  'post /partner/adminGetPartnerJobReport': 'PartnerController.adminGetPartnerJobReport',
  'post /partner/logout': 'PartnerController.logout',
  'post /partner/countPartnersByDistrict': 'PartnerController.countPartnersByDistrict',
  'post /partner/findOrders': 'OrderController.partnerFindOrders',
  'post /partner/acceptOrder': 'OrderController.partnerAcceptOrder',
  'post /partner/deniedOrder': 'OrderController.partnerDenyOrder',
  'post /partner/denyOrder': 'OrderController.partnerDenyOrder',
  'post /partner/cancelOrder': 'OrderController.partnerCancelOrder',
  'post /partner/goOffline': 'PartnerController.partnerGoOffline',
  'post /partner/finishOrder': 'OrderController.partnerFinishOrder',
  'post /partner/startOrder': 'OrderController.partnerStartOrder',

  //administrator

  'post /admin/removeDistrictFromPartner': 'DistrictController.removeDistrictFromPartner',
  'post /admin/addDistrictToPartner': 'DistrictController.addDistrictToPartner',
  'post /partner/findPartnersByDistrict': 'PartnerController.findPartnersByDistrict',
  'post /admin/findOrders': 'OrderController.adminFindOrders',

  'post /admin/findCategories': 'CategoryController.findCategories',
  'post /partner/blockPartner': 'PartnerController.adminBlockPartner',
  'post /partner/unblockPartner': 'PartnerController.adminUnblockPartner',
  'post /admin/addJobToPartner': 'JobController.addJobToPartner',
  'post /admin/removeJobFromPartner': 'JobController.removeJobFromPartner',
  //job
  'post /job/customerFindAvailableJobs': 'JobController.customerFindAvailableJobs',
  'post /job/createJob': 'JobController.createJob',
  'post /job/deleteJob': 'JobController.deleteJob',
  'post /job/editJob': 'JobController.editJob',
  'post /job/findJobs': 'JobController.findJobs',


  'post /voucher/createVouchers': 'VoucherController.createVouchers',
  'post /voucher/deleteVouchers': 'VoucherController.deleteVouchers',
  'post /voucher/findVouchers': 'VoucherController.findVouchers',
  'post /partner/approvePartner': 'PartnerController.adminApprovePartner',
  'post /partner/adminApprovePartnerSimple': 'PartnerController.adminApprovePartnerSimple',
  'post /voucher/useVoucher': 'VoucherController.useVoucher',

  //meta
  'post /meta/findJobAndCategories': 'MetaController.findJobAndCategories',
  //blog

  // 'post /blog/findPosts': 'PostController.findPosts',
  //blog categories
  'post /blogcategory/findBlogCategories': 'BlogCategoryController.findBlogCategories',
  'post /blogcategory/adminEditBlogCategory': 'BlogCategoryController.adminEditBlogCategory',
  'post /blogcategory/adminDeleteBlogCategory': 'BlogCategoryController.adminDeleteBlogCategory',
  'post /blogcategory/adminCreateBlogCategory': 'BlogCategoryController.adminCreateBlogCategory',



  //order

  'get /order/customerPay3DSForm': 'OrderController.customerPay3DSForm',
  'post /order/manualBookOrder': 'OrderController.manualBookOrder',
  'post /order/findPartnerByConditions': 'OrderController.findPartnerByConditions',
  'post /order/reportOrders': 'OrderController.reportOrders',
  'post /order/partnerUploadReport': 'OrderController.partnerUploadReport',
  'post /order/verifyOtpPay': 'OrderController.verifyOtpPay',

  'post /order/partnerFindOrders': 'OrderController.partnerFindOrders',
  //service

  'post /service/customerFindServices': 'ServiceController.customerFindServices',
  'post /service/officerFindServices': 'ServiceController.officerFindServices',
  'post /service/officerLockService': 'ServiceController.officerLockService',
  'post /service/officerUnlockService': 'ServiceController.officerUnlockService',
  'post /service/officerProcessService': 'ServiceController.officerProcessService',


  //dependecy
  'post /dependency/createDependency': 'DependencyController.createDependency',
  'post /dependency/editDependency': 'DependencyController.editDependency',
  'post /dependency/deleteDependency': 'DependencyController.deleteDependency',
  'post /dependency/adminFindDependency': 'DependencyController.adminFindDependency',
  'post /dependency/customerFindDependency': 'DependencyController.customerFindDependency',

  //freetime
  'post /freetime/partnerRegisterFreeTime': 'FreeTimeController.partnerRegisterFreeTime',
  'post /freetime/partnerFindFreeTime': 'FreeTimeController.partnerFindFreeTime',
  'post /freetime/adminFindFreeTime': 'FreeTimeController.adminFindFreeTime',

  //cancelReason
  'post /cancelReason/findCancelReasons': 'CancelReasonController.findCancelReasons',
  'post /cancelReason/createCancelReason': 'CancelReasonController.createCancelReason',
  'post /cancelReason/deleteCancelReason': 'CancelReasonController.deleteCancelReason',
  'post /cancelReason/editCancelReason': 'CancelReasonController.editCancelReason',



  //city
  'post /city/adminCreateCity': 'CityController.adminCreateCity',
  'post /city/adminDeleteCity': 'CityController.adminDeleteCity',
  'post /city/adminEditCity': 'CityController.adminEditCity',
  'post /city/findCities': 'CityController.findCities',
  'post /city/addCityToJob': 'CityController.addCityToJob',

  // report
  'post /report/reportOrderStatus': 'ReportController.reportOrderStatus',
  'post /report/getAdminPageReport': 'ReportController.getAdminPageReport',
  'post /report/getAdminPageReports': 'ReportController.getAdminPageReports',

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
