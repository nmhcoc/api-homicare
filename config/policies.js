/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  '*': false,
  ComboOrderController: {
    order: 'bearerCustomer',
    find: 'bearerCustomer'
  },
  ImageController: {
    upload: 'bearer'
  },
  ComboPricingController: {
    find: true,
    update: ['bearerOfficer', 'roleOfficer'],
    create: ['bearerOfficer', 'roleOfficer'],
    delete: ['bearerOfficer', 'roleOfficer']
  },
  ComboController: {
    find: true,
    update: ['bearerOfficer', 'roleOfficer'],
    create: ['bearerOfficer', 'roleOfficer'],
    delete: ['bearerOfficer', 'roleOfficer']
  },
  FaqController: {
    find: true,
    update: ['bearerOfficer', 'roleOfficer'],
    create: ['bearerOfficer', 'roleOfficer'],
    delete: ['bearerOfficer', 'roleOfficer']
  },
  AgencyController: {
    findPartners: ['bearerOfficer', 'roleOfficer'],
    findOrders: ['bearerOfficer', 'roleOfficer'],
    find: ['bearerOfficer', 'roleOfficer'],
    update: ['bearerOfficer', 'roleOfficer'],
    create: ['bearerOfficer', 'roleOfficer'],
    delete: ['bearerOfficer', 'roleOfficer'],
  },
  NotificationController: {
    find: 'bearer',
    toggleRead: 'bearer',
    findOne: 'bearer',
    delete: 'bearer'
  },
  ContactController: {
    getListContacts: 'basicContact'
  },
  LoyaltyLevelController: {
    findUpdate: ['bearerOfficer', 'roleOfficer'],
    findCache: ['bearerCustomer'],
    getNextRank: ['bearerCustomer'],
    create: ['bearerOfficer', 'roleOfficer'],
    update: ['bearerOfficer', 'roleOfficer'],
    delete: ['bearerOfficer', 'roleOfficer'],
  },
  PointHistoryController: {
    find: ['bearerCustomer']
  },
  IpnController: {
    listen: true
  },
  AreaController: {
    find: ['bearerOfficer', 'roleOfficer'],
    update: ['bearerOfficer', 'roleOfficer'],
    create: ['bearerOfficer', 'roleOfficer'],
    delete: ['bearerOfficer', 'roleOfficer'],
  },
  LoyaltyController: {
    myPromotions: 'bearer',
    getCode: 'bearer',
    comment: 'bearer',
    rate: 'bearer',
  },
  VnpController: {
    payOrder: 'bearerCustomer',
    orderReturn: true
  },
  JobMetaController: {
    findJobMetas: ['bearerOfficer', 'roleOfficer'],
    createJobMeta: ['bearerOfficer', 'roleOfficer'],
    deleteJobMeta: ['bearerOfficer', 'roleOfficer'],
    editJobMeta: ['bearerOfficer', 'roleOfficer'],
  },
  CommentController: {
    userCreateComment: 'bearer',
    userGetComments: 'bearer',
    // officerToggleComment: ['bearerOfficer', 'roleOfficer'],
    officerGetComments: ['bearerOfficer', 'roleOfficer']
  },
  CompanyController: {
    adminFindCompanies: ['bearerOfficer', 'roleOfficer'],
    adminEditCompany: ['bearerOfficer', 'roleOfficer'],
    adminCreateCompany: ['bearerOfficer', 'roleOfficer'],
    adminDeleteCompany: ['bearerOfficer', 'roleOfficer']
  },
  DevController: {
    '*': true
  },
  ReportController: {
    adminGetDashboardReport: 'bearerOfficer'
  },
  ExpertOrderController: {
    customerCreateExpertOrder: 'bearerCustomer',
    customerFindExpertOrders: 'bearerCustomer',
    officerFindExpertOrders: 'bearerOfficer',
    officerLockExpertOrder: 'bearerOfficer',
    officerUnlockExpertOrder: 'bearerOfficer',
    officerBookExpertOrder: 'bearerOfficer'
  },
  ExpertController: {
    findExperts: true,
    adminDeleteExpert: ['bearerOfficer', 'roleOfficer'],
    adminCreateExpert: ['bearerOfficer', 'roleOfficer'],
    adminEditExpert: ['bearerOfficer', 'roleOfficer']
  },
  LongOrderController: {
    customerCreateLongOrder: 'bearerCustomer',
    customerFindLongOrders: 'bearerCustomer',
    officerFindLongOrders: 'bearerOfficer',
    officerProcessLongOrder: 'bearerOfficer',
    officerLockLongOrder: 'bearerOfficer',
    officerUnLockLongOrder: 'bearerOfficer'
  },
  TaskController: {
    // find: true,
    // update: true,
    // start: true,
    // stop: true,
    // create: true,
    // delete: true,
    find: ['bearerOfficer', 'roleOfficer'],
    update: ['bearerOfficer', 'roleOfficer'],
    start: ['bearerOfficer', 'roleOfficer'],
    stop: ['bearerOfficer', 'roleOfficer'],
    restart: ['bearerOfficer', 'roleOfficer'],
    create: ['bearerOfficer', 'roleOfficer'],
    delete: ['bearerOfficer', 'roleOfficer'],
  },
  CrashReportController: {
    addCrashReport: true
  },
  ConfController: {
    findConfigs: ['bearerOfficer', 'roleOfficer'],
    createConfig: ['bearerOfficer', 'roleOfficer'],
    editConfig: ['bearerOfficer', 'roleOfficer'],
    deleteConfig: ['bearerOfficer', 'roleOfficer'],
  },
  JournalController: {
    findJournalEntries: true//['bearerOfficer', 'roleOfficer'],
  },
  JobMetaController: {
    findJobMetas: ['bearerOfficer', 'roleOfficer'],
    createJobMeta: ['bearerOfficer', 'roleOfficer'],
    deleteJobMeta: ['bearerOfficer', 'roleOfficer'],
    editJobMeta: ['bearerOfficer', 'roleOfficer'],
  },
  DevController: {
    '*': true
  },
  MenuController: {
    findMenus: ['bearerOfficer', 'roleOfficer'],
    addMenu: ['bearerOfficer', 'roleOfficer'],
    deleteMenu: ['bearerOfficer', 'roleOfficer'],
    editMenu: ['bearerOfficer', 'roleOfficer'],
    findOwnMenus: ['bearerOfficer', 'roleOfficer']
  },
  ReportController: {
    adminGetDashboardReport: ['bearerOfficer', 'roleOfficer'],
    getLandingPageReport: true,
    reportOrderStatus: ['bearerOfficer', 'roleOfficer'],

    getAdminPageReport: ['bearerOfficer', 'roleOfficer'],
    getAdminPageReports: ['bearerOfficer', 'roleOfficer'],
  },
  CityController: {
    adminCreateCity: ['bearerOfficer', 'roleOfficer'],
    adminDeleteCity: ['bearerOfficer', 'roleOfficer'],
    adminEditCity: ['bearerOfficer', 'roleOfficer'],
    findCities: true,
    addCityToJob: ['bearerOfficer', 'roleOfficer']
  },
  CustomerController: {
    deleteAllInfo: ['bearerOfficer', 'roleOfficer'],
    adminCreateCustomer: ['bearerOfficer', 'roleOfficer'],
    adminFindCustomers: ['bearerOfficer', 'roleOfficer'],
    register: ['basicCustomer'],
    findNearbyPartners: ['bearerCustomer'],
    becomePartner: ['bearerCustomer'],
    logout: 'bearerCustomer',
    suggestAll: ['bearerCustomer'],
  },
  InviteCodeController: {
    createInviteCode: 'bearer'
  },
  PartnerQueueController: {
    partnerRegisterQueue: ['bearerPartner'],
  },
  PromotionController: {
    findPromotions: ['bearer'],
    adminCreatePromotion: ['bearerOfficer', 'roleOfficer'],
    adminFindPromotions: ['bearerOfficer', 'roleOfficer'],
    adminDeletePromotion: ['bearerOfficer', 'roleOfficer'],
  },
  TransactionController: {
    userFindTransactions: 'bearer',
    adminFindTransactions: ['bearerOfficer', 'roleOfficer'],
  },
  UserRoleController: {
    findRoles: ['bearerOfficer', 'roleOfficer'],
    createRole: ['bearerOfficer', 'roleOfficer'],
    deleteRole: ['bearerOfficer', 'roleOfficer'],
    updateRolePermissions: ['bearerOfficer', 'roleOfficer'],
    updateRoleMenus: ['bearerOfficer', 'roleOfficer'],
    findPermissions: true
  },
  AccountController: {
    cashOut: ['bearerOfficer', 'roleOfficer'],
    cashIn: ['bearerOfficer', 'roleOfficer'],
    createNewAccount: ['bearerOfficer', 'roleOfficer'],
  },
  CancelReasonController: {
    findCancelReasons: ['bearerOfficer', 'roleOfficer'],
    createCancelReason: ['bearerOfficer', 'roleOfficer'],
    deleteCancelReason: ['bearerOfficer', 'roleOfficer'],
    editCancelReason: ['bearerOfficer', 'roleOfficer'],
  },
  FreeTimeController: {
    partnerRegisterFreeTime: ['bearerPartner'],
    partnerFindFreeTime: ['bearerPartner'],
    adminFindFreeTime: ['bearerOfficer', 'roleOfficer'],
  },
  Dependency: {
    createDependency: ['bearerCustomer'],
    editDependency: ['bearerCustomer'],
    deleteDependency: ['bearerCustomer'],
    customerFindDependency: ['bearerCustomer'],
    adminFindDependency: ['bearerOfficer', 'roleOfficer']
  },
  UserController: {
    // register: ['basic'],
    register: 'basic',
    updateProfile: ['bearer'],
    profile: 'bearer',
    login: ['basic', 'local'],
    logout: ['bearer'],
    refreshToken: ['basic'],
    forgotPassword: ['basic'],
    isUserExist: ['basic'],
    uploadAvatar: 'bearer',
    changePassword: 'bearer',

    adminResetPassword: ['bearerOfficer', 'roleOfficer'],
    adminCreateUser: ['bearerOfficer', 'roleOfficer'],
    setDefaultMethod: ['bearerCustomer'],
  },
  PartnerController: {
    countOrder: 'bearerPartner',
    deleteAllInfo: ['bearerOfficer', 'roleOfficer'],
    adminUpdatePartnerInfo: ['bearerOfficer', 'roleOfficer'],
    cashIn: ['bearerOfficer', 'roleOfficer'],
    adminGetPartnerJobReport: ['bearerOfficer', 'roleOfficer'],
    keepAlived: ['bearerPartner'],
    adminApprovePartner: ['bearerOfficer', 'roleOfficer'],
    adminApprovePartnerSimple: ['bearerOfficer', 'roleOfficer'],
    adminFindPartners: ['bearerOfficer', 'roleOfficer'], //adminFindUsers
    findPartnersByDistrict: ['bearerOfficer', 'roleOfficer'],
    adminBlockPartner: ['bearerOfficer', 'roleOfficer'],
    partnerGoOffline: ['bearerPartner'],
    adminUnblockPartner: ['bearerOfficer', 'roleOfficer'],
    logout: ['bearerPartner'],
  },
  OfficerController: {
    updateUserProfile: ['bearerOfficer', 'roleOfficer'],
    resetCache: ['bearerOfficer', 'roleOfficer'],
    officerRemoveUserRole: ['bearerOfficer', 'roleOfficer'],
    officerAddUserRole: ['bearerOfficer', 'roleOfficer'],
    adminFindOfficers: ['bearerOfficer', 'roleOfficer'],
    addUserRoleToUser: ['bearerOfficer', 'roleOfficer'],
    removeUserRoleFromUser: ['bearerOfficer', 'roleOfficer'],
    createOfficer: ['bearerOfficer', 'roleOfficer'],
    logout: ['bearerOfficer', 'roleOfficer']
  },
  CardController: {
    decodeIPN: true,
    ipn: true,
    paymentReturn: true,
    getCardForm: ['bearer'],
    findCards: 'bearer'
  },
  JobController: {
    findJobs: true,
    customerFindAvailableJobs: true,
    editJob: ['bearerOfficer', 'roleOfficer'],
    createJob: ['bearerOfficer', 'roleOfficer'],
    deleteJob: ['bearerOfficer', 'roleOfficer'],
    addJobToPartner: ['bearerOfficer', 'roleOfficer'],
    removeJobFromPartner: ['bearerOfficer', 'roleOfficer']
  },
  DistrictController: {
    removeDistrictFromPartner: ['bearerOfficer', 'roleOfficer'],
    addDistrictToPartner: ['bearerOfficer', 'roleOfficer']
  },
  CategoryController: {
    findCategories: true
  },
  OrderController: {

    customerPay3DSForm: 'bearerCustomer',
    manualBookOrder: ['bearerOfficer'],
    findPartnerByConditions: ['bearerOfficer'],
    customerPayByCard: 'bearerCustomer',
    countPartnersByDistrict: ['bearerOfficer', 'roleOfficer'],
    reportOrders: ['bearerOfficer', 'roleOfficer'],
    verifyOtpPay: ['bearerCustomer'],
    customerRateOrder: ['bearerCustomer'],
    partnerStartOrder: ['bearerPartner'],
    customerReportOrder: ['bearerCustomer'],
    partnerUploadReport: ['bearerPartner'],
    adminFindOrders: ['bearerOfficer', 'roleOfficer'],
    customerFindOrders: ['bearerCustomer'],
    customerCancelOrder: ['bearerCustomer'],
    customerCreateOrder: ['bearerCustomer'],
    partnerFindOrders: ['bearerPartner'],
    partnerAcceptOrder: ['bearerPartner'],
    partnerDenyOrder: ['bearerPartner'],
    partnerCancelOrder: ['bearerPartner'],
    pricing: ['bearerCustomer'],
    partnerFinishOrder: ['bearerPartner'],

  },
  VoucherController: {
    createVouchers: ['bearerOfficer', 'roleOfficer'],
    deleteVouchers: ['bearerOfficer', 'roleOfficer'],
    findVouchers: ['bearerOfficer', 'roleOfficer'],
    useVoucher: ['bearerCustomer']
  },
  BlogCategoryController: {
    findBlogCategories: true,
    adminEditBlogCategory: ['bearerOfficer', 'roleOfficer'],
    adminDeleteBlogCategory: ['bearerOfficer', 'roleOfficer'],
    adminCreateBlogCategory: ['bearerOfficer', 'roleOfficer'],
  },
  PostController: {
    adminCreatePost: ['bearerOfficer', 'roleOfficer'],
    adminEditPost: ['bearerOfficer', 'roleOfficer'],
    findPosts: true,
    adminDeletePost: ['bearerOfficer', 'roleOfficer'],
  },
  MetaController: {
    '*': true,
    findJobAndCategories: 'basic'
  },
  ServiceController: {
    customerFindServices: 'bearerCustomer',
    customerOrderService: ['bearerCustomer'],
    officerFindServices: ['bearerOfficer', 'roleOfficer'],
    officerLockService: ['bearerOfficer', 'roleOfficer'],
    officerUnlockService: ['bearerOfficer', 'roleOfficer'],
    officerProcessService: ['bearerOfficer', 'roleOfficer'],

  }
  /***************************************************************************
  *                                                                          *
  * Here's an example of mapping some policies to run before a controller    *
  * and its actions                                                          *
  *                                                                          *
  ***************************************************************************/
  // RabbitController: {

  // Apply the `false` policy as the default for all of RabbitController's actions
  // (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
  // '*': false,

  // For the action `nurture`, apply the 'isRabbitMother' policy
  // (this overrides `false` above)
  // nurture	: 'isRabbitMother',

  // Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
  // before letting any users feed our rabbits
  // feed : ['isNiceToAnimals', 'hasRabbitFood']
  // }
};
