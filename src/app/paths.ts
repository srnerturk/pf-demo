/** Every address the app answers to, in one place so links and redirects can't drift apart. */
export const paths = {
  home: '/',
  signIn: '/auth/login',
  accessControl: {
    users: '/access-control/users',
    roles: '/access-control/roles',
    permissions: '/access-control/permissions',
    signInHistory: '/access-control/sign-in-history',
  },
  configuration: {
    general: '/configuration/general',
    posTerminals: '/configuration/pos-terminals',
    commissions: '/configuration/commissions',
    currencies: '/configuration/currencies',
  },
  management: {
    banks: '/management/banks',
    announcements: '/management/announcements',
    notificationTemplates: '/management/notification-templates',
    auditLog: '/management/audit-log',
  },
} as const
