import { useState, useEffect, useRef } from 'react'
import HouzeifySplashPage from './imports/HouzeifySplashPage/index'
import WelcomeScreen from '@/shared/auth/WelcomeScreen'
import LoginScreen from '@/shared/auth/LoginScreen'
import OtpScreen from '@/shared/auth/OtpScreen'
import CreateAccountScreen from '@/shared/auth/CreateAccountScreen'
import AccountCreatedScreen from '@/user/onboarding/AccountCreatedScreen'
import BuildOrImproveScreen from '@/user/build-renovate/BuildOrImproveScreen'
import RenovateSelectAreaScreen from '@/user/renovation/RenovateSelectAreaScreen'
import RenovateSpaceDetailsScreen from '@/user/renovation/RenovateSpaceDetailsScreen'
import RenovateRequirementsScreen from '@/user/renovation/RenovateRequirementsScreen'
import RenovateBudgetTimelineScreen from '@/user/renovation/RenovateBudgetTimelineScreen'
import RenovateUploadScreen from '@/user/renovation/RenovateUploadScreen'
import RenovateReviewScreen from '@/user/renovation/RenovateReviewScreen'
import RenovateAIPlanScreen from '@/user/renovation/RenovateAIPlanScreen'
import RenovateEstimateScreen from '@/user/renovation/RenovateEstimateScreen'
import RenovateProceedScreen from '@/user/renovation/RenovateProceedScreen'
import RenovatePackagesScreen from '@/user/renovation/RenovatePackagesScreen'
import RenovateProfessionalsScreen from '@/user/renovation/RenovateProfessionalsScreen'
import RenovateCustomQuoteScreen from '@/user/renovation/RenovateCustomQuoteScreen'
import RenovateSelectionReviewScreen from '@/user/renovation/RenovateSelectionReviewScreen'
import RenovateBookScreen from '@/user/renovation/RenovateBookScreen'
import RenovateProjectCreatedScreen from '@/user/renovation/RenovateProjectCreatedScreen'
import ProfessionalTypeScreen from '@/partner/onboarding/ProfessionalTypeScreen'
import ProfessionalSpecializationScreen from '@/partner/onboarding/ProfessionalSpecializationScreen'
import ProfessionalProfileSetupScreen from '@/partner/onboarding/ProfessionalProfileSetupScreen'
import HomeownerOnboardingScreen from '@/user/onboarding/HomeownerOnboardingScreen'
import { resolveUserRole } from './data/primaryIntent'
import HomeownerProfileScreen from '@/user/onboarding/HomeownerProfileScreen'
import LocationSetupScreen from '@/user/onboarding/LocationSetupScreen'
import ConstructionIntentScreen from '@/user/onboarding/ConstructionIntentScreen'
import AccountTypeScreen from '@/shared/screens/AccountTypeScreen'
import CreateOrganizationScreen from '@/shared/screens/CreateOrganizationScreen'
import CompanyInformationScreen from '@/shared/screens/CompanyInformationScreen'
import BusinessVerificationScreen from '@/partner/onboarding/BusinessVerificationScreen'
import ServiceCategoriesScreen from '@/shared/screens/ServiceCategoriesScreen'
import ServiceLocationsScreen from '@/partner/onboarding/ServiceLocationsScreen'
import PortfolioSetupScreen from '@/partner/onboarding/PortfolioSetupScreen'
import TeamSetupScreen from '@/partner/onboarding/TeamSetupScreen'
import OrganizationSubmittedScreen from '@/shared/screens/OrganizationSubmittedScreen'
import HomeDashboardScreen from '@/user/dashboard/HomeDashboardScreen'
import ProfessionalDashboardScreen from '@/partner/dashboard/ProfessionalDashboardScreen'
import CompanyProfileScreen from '@/partner/organization/CompanyProfileScreen'
import EditServicesScreen from '@/partner/organization/EditServicesScreen'
import EditServiceLocationsScreen from '@/partner/organization/EditServiceLocationsScreen'
import PortfolioScreen from '@/partner/organization/PortfolioScreen'
import AddPortfolioProjectScreen from '@/partner/organization/AddPortfolioProjectScreen'
import ReviewsRatingsScreen from '@/shared/screens/ReviewsRatingsScreen'
import OrganizationSettingsScreen from '@/shared/screens/OrganizationSettingsScreen'
import TeamManagementScreen from '@/partner/organization/TeamManagementScreen'
import TeamMemberDetailScreen from '@/shared/screens/TeamMemberDetailScreen'
import RolesPermissionsScreen from '@/partner/organization/RolesPermissionsScreen'
import OrganizationProfileScreen from '@/shared/screens/OrganizationProfileScreen'
import NotificationsScreen from '@/user/dashboard/NotificationsScreen'
import PersonalProfileScreen from '@/shared/screens/PersonalProfileScreen'
import PreferencesScreen from '@/user/dashboard/PreferencesScreen'
import AccountSettingsScreen from '@/shared/screens/AccountSettingsScreen'
import PlansBillingScreen from '@/shared/screens/PlansBillingScreen'
import DiscoverProjectsScreen from '@/partner/opportunities/DiscoverProjectsScreen'
import ProjectOpportunityDetailScreen from '@/partner/opportunities/ProjectOpportunityDetailScreen'
import SubmitBidScreen from '@/partner/opportunities/SubmitBidScreen'
import BidSubmittedScreen from '@/partner/opportunities/BidSubmittedScreen'
import MyBidsScreen from '@/partner/opportunities/MyBidsScreen'
import FindContractorsScreen from '@/user/new-build/FindContractorsScreen'
import ContractorProfileScreen from '@/user/new-build/ContractorProfileScreen'
import InviteContractorScreen from '@/user/new-build/InviteContractorScreen'
import BidsReceivedScreen from '@/user/new-build/BidsReceivedScreen'
import BidDetailScreen from '@/shared/screens/BidDetailScreen'
import CompareBidsScreen from '@/user/new-build/CompareBidsScreen'
import AwardContractorScreen from '@/user/new-build/AwardContractorScreen'
import ContractorSelectedScreen from '@/user/new-build/ContractorSelectedScreen'
import ProjectWorkspaceScreen from '@/user/projects/ProjectWorkspaceScreen'
import ProjectsListScreen from '@/user/projects/ProjectsListScreen'
import ProjectOverviewScreen from '@/user/projects/ProjectOverviewScreen'
import ProjectTeamScreen from '@/user/projects/ProjectTeamScreen'
import ProjectMessagesScreen from '@/user/projects/ProjectMessagesScreen'
import ProjectDocumentsScreen from '@/user/projects/ProjectDocumentsScreen'
import ProjectBoqScreen from '@/user/projects/ProjectBoqScreen'
import ProjectTasksScreen from '@/user/projects/ProjectTasksScreen'
import ProjectIssuesScreen from '@/user/projects/ProjectIssuesScreen'
import ProjectProgressScreen from '@/user/projects/ProjectProgressScreen'
import ProjectWorkforceScreen from '@/user/projects/ProjectWorkforceScreen'
import ProjectCustomerScreen from '@/user/projects/ProjectCustomerScreen'
import ProjectPhotosScreen from '@/user/projects/ProjectPhotosScreen'
import ProjectTimelineScreen from '@/user/projects/ProjectTimelineScreen'
import ProjectConstructionRecordScreen from '@/user/projects/ProjectConstructionRecordScreen'
import CompanyProgressScreen from '@/partner/projects/CompanyProgressScreen'
import CompanyReportsScreen from '@/partner/projects/CompanyReportsScreen'
import CompanyWorkforceScreen from '@/partner/projects/CompanyWorkforceScreen'
import CompanyDocumentsScreen from '@/partner/projects/CompanyDocumentsScreen'
import CompanyOpenWorkScreen from '@/partner/projects/CompanyOpenWorkScreen'
import ProjectSettingsScreen from '@/user/projects/ProjectSettingsScreen'
import AIAdvisorScreen from '@/user/dashboard/AIAdvisorScreen'
import HomeServicesScreen from '@/user/home-services/HomeServicesScreen'
import HoziehelperGoldScreen from '@/user/home-services/categories/HoziehelperGoldScreen'
import SalonLuxeScreen from '@/user/home-services/categories/SalonLuxeScreen'
import PrimeScreen from '@/user/home-services/categories/PrimeScreen'
import SpaLuxeScreen from '@/user/home-services/categories/SpaLuxeScreen'
import SpaPrimeScreen from '@/user/home-services/categories/SpaPrimeScreen'
import SpaAyurvedaScreen from '@/user/home-services/categories/SpaAyurvedaScreen'
import HairStudioForWomenScreen from '@/user/home-services/categories/HairStudioForWomenScreen'
import MakeupSareeStylingScreen from '@/user/home-services/categories/MakeupSareeStylingScreen'
import SalonRoyaleScreen from '@/user/home-services/categories/SalonRoyaleScreen'
import SalonPrimeScreen from '@/user/home-services/categories/SalonPrimeScreen'
import MassageRoyaleScreen from '@/user/home-services/categories/MassageRoyaleScreen'
import MassagePrimeScreen from '@/user/home-services/categories/MassagePrimeScreen'
import MassageAyurvedaScreen from '@/user/home-services/categories/MassageAyurvedaScreen'
import BathroomCleaningScreen from '@/user/home-services/categories/BathroomCleaningScreen'
import KitchenCleaningScreen from '@/user/home-services/categories/KitchenCleaningScreen'
import LivingBedroomCleaningScreen from '@/user/home-services/categories/LivingBedroomCleaningScreen'
import FullHomeCleaningScreen from '@/user/home-services/categories/FullHomeCleaningScreen'
import CockroachControlScreen from '@/user/home-services/categories/CockroachControlScreen'
import TermiteControlScreen from '@/user/home-services/categories/TermiteControlScreen'
import AntsBedBugsControlScreen from '@/user/home-services/categories/AntsBedBugsControlScreen'
import WallPanelsScreen from '@/user/home-services/categories/WallPanelsScreen'
import PaintingFewWallsRoomsScreen from '@/user/home-services/categories/PaintingFewWallsRoomsScreen'
import ElectricianScreen from '@/user/home-services/categories/ElectricianScreen'
import PlumbingScreen from '@/user/home-services/categories/PlumbingScreen'
import CarpentryScreen from '@/user/home-services/categories/CarpentryScreen'
import CivilWorkScreen from '@/user/home-services/categories/CivilWorkScreen'
import FurnitureAssemblyScreen from '@/user/home-services/categories/FurnitureAssemblyScreen'
import GeyserServiceRepairScreen from '@/user/home-services/categories/GeyserServiceRepairScreen'
import TileGroutingScreen from '@/user/home-services/categories/TileGroutingScreen'
import LightsInstallationScreen from '@/user/home-services/categories/LightsInstallationScreen'
import HoziehelperStandardScreen from '@/user/home-services/categories/HoziehelperStandardScreen'
import CheckoutScreen from '@/user/home-services/CheckoutScreen'
import BookingDetailsScreen from '@/user/home-services/BookingDetailsScreen'
import AddressScreen from '@/user/home-services/AddressScreen'
import SavedAddressesScreen from '@/user/home-services/SavedAddressesScreen'
import DateTimeScreen from '@/user/home-services/DateTimeScreen'
import BookingConfirmationScreen from '@/user/home-services/BookingConfirmationScreen'
import MyBookingsScreen from '@/user/home-services/MyBookingsScreen'
import BookingDetailScreen from '@/user/home-services/BookingDetailScreen'
import { CustomerCartProvider } from '@/data/customerCart'
import { CustomerAddressProvider } from '@/data/customerAddress'
import { SubscriptionProvider } from '@/data/subscriptionState'
import { useAuth } from '@/data/authState'
import { useCustomerProfile } from '@/data/customerProfileState'
import { usePartnerProfile } from '@/data/partnerProfileState'
import { useOrganizations } from '@/data/organizationState'
import { useHouseRequirements } from '@/data/houseRequirementsState'
import ServiceCategoryDetailScreen from '@/user/home-services/categories/ServiceCategoryDetailScreen'
import CreateProjectScreen from '@/user/new-build/CreateProjectScreen'
import HouseRequirementsScreen from '@/user/new-build/HouseRequirementsScreen'
import { getHouseRequirementsForProject } from '@/data/houseRequirements'
import ReviewRequirementsScreen from '@/user/new-build/ReviewRequirementsScreen'
import ProjectAgreementScreen from '@/user/new-build/ProjectAgreementScreen'
import ReviewAcceptAgreementScreen from '@/user/new-build/ReviewAcceptAgreementScreen'
import PaymentAdvanceScreen from '@/user/new-build/PaymentAdvanceScreen'
import EstimateLoadingScreen from '@/user/new-build/EstimateLoadingScreen'
import EstimateDashboardScreen from '@/user/new-build/EstimateDashboardScreen'
import CostBreakdownScreen from '@/user/new-build/CostBreakdownScreen'
import MaterialEstimateScreen from '@/user/new-build/MaterialEstimateScreen'
import LabourEstimateScreen from '@/user/new-build/LabourEstimateScreen'
import ConstructionStagesScreen from '@/user/new-build/ConstructionStagesScreen'
import CostAssumptionsScreen from '@/user/new-build/CostAssumptionsScreen'
import EstimateComparisonScreen from '@/user/new-build/EstimateComparisonScreen'
import EstimateRevisionScreen from '@/user/new-build/EstimateRevisionScreen'
import FinalEstimateScreen from '@/user/new-build/FinalEstimateScreen'
import BOQOverviewScreen from '@/user/new-build/BOQOverviewScreen'
import DetailedBOQScreen from '@/user/new-build/DetailedBOQScreen'
import BOQItemDetailScreen from '@/user/new-build/BOQItemDetailScreen'
import BOQEditScreen from '@/user/new-build/BOQEditScreen'
import BOQVersionHistoryScreen from '@/user/new-build/BOQVersionHistoryScreen'
import MaterialCalculatorScreen from '@/user/new-build/MaterialCalculatorScreen'
import MaterialDetailScreen from '@/user/new-build/MaterialDetailScreen'
import MaterialPriceCheckScreen from '@/user/new-build/MaterialPriceCheckScreen'
import UploadPlanScreen from '@/user/new-build/UploadPlanScreen'
import PlanAnalysisLoadingScreen from '@/user/new-build/PlanAnalysisLoadingScreen'
import PlanAnalysisResultScreen from '@/user/new-build/PlanAnalysisResultScreen'
import PlanMeasurementScreen from '@/user/new-build/PlanMeasurementScreen'
import PlanVsEstimateScreen from '@/user/new-build/PlanVsEstimateScreen'
import EstimateUpdateScreen from '@/user/new-build/EstimateUpdateScreen'
import ComingSoonScreen from '@/shared/screens/ComingSoonScreen'
import CompanyProjectsListScreen from '@/partner/projects/CompanyProjectsListScreen'
import CreateConstructionProjectScreen from '@/partner/projects/CreateConstructionProjectScreen'
import CreateDailyProgressScreen from '@/partner/projects/CreateDailyProgressScreen'

type AppScreen =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'otp'
  | 'create-account'
  | 'account-created'
  | 'build-or-improve'
  | 'renovate-select-area'
  | 'renovate-space-details'
  | 'renovate-requirements'
  | 'renovate-budget-timeline'
  | 'renovate-upload'
  | 'renovate-review'
  | 'renovate-ai-plan'
  | 'renovate-estimate'
  | 'renovate-proceed'
  | 'renovate-packages'
  | 'renovate-professionals'
  | 'renovate-custom-quote'
  | 'renovate-selection-review'
  | 'renovate-book'
  | 'renovate-project-created'
  | 'professional-type'
  | 'professional-specialization'
  | 'professional-profile-setup'
  | 'onboarding-homeowner'
  | 'location-setup'
  | 'home-intent'
  | 'account-type'
  | 'create-organization'
  | 'company-information'
  | 'business-verification'
  | 'service-categories'
  | 'service-locations'
  | 'portfolio-setup'
  | 'company-profile'
  | 'edit-services'
  | 'edit-service-locations'
  | 'portfolio'
  | 'add-portfolio-project'
  | 'reviews-ratings'
  | 'organization-settings'
  | 'team-management'
  | 'team-member-detail'
  | 'roles-permissions'
  | 'organization-profile'
  | 'notifications'
  | 'personal-profile'
  | 'preferences'
  | 'account-settings'
  | 'plans-billing'
  | 'team-setup'
  | 'organization-submitted'
  | 'homeowner-profile'
  | 'dashboard-home'
  | 'professional-dashboard'
  | 'discover-projects'
  | 'project-opportunity-detail'
  | 'submit-bid'
  | 'bid-submitted'
  | 'my-bids'
  | 'find-contractors'
  | 'contractor-profile'
  | 'invite-contractor'
  | 'bids-received'
  | 'bid-detail'
  | 'compare-bids'
  | 'award-contractor'
  | 'contractor-selected'
  | 'project-agreement'
  | 'review-accept-agreement'
  | 'payment-advance'
  | 'project-workspace'
  | 'projects-list'
  | 'project-overview'
  | 'project-team'
  | 'project-messages'
  | 'project-documents'
  | 'project-tasks'
  | 'project-progress'
  | 'ai-advisor'
  | 'home-services'
  | 'hoziehelper-gold'
  | 'hoziehelper-standard'
  | 'salon-luxe'
  | 'prime'
  | 'spa-luxe'
  | 'spa-prime'
  | 'spa-ayurveda'
  | 'hair-studio-for-women'
  | 'makeup-saree-styling'
  | 'salon-royale'
  | 'salon-prime'
  | 'massage-royale'
  | 'massage-prime'
  | 'massage-ayurveda'
  | 'bathroom-cleaning'
  | 'kitchen-cleaning'
  | 'living-bedroom-cleaning'
  | 'full-home-cleaning'
  | 'cockroach-control'
  | 'termite-control'
  | 'ants-bedbugs-control'
  | 'wall-panels-installation'
  | 'painting-few-walls-rooms'
  | 'electrician'
  | 'plumbing'
  | 'carpentry'
  | 'civil-work'
  | 'furniture-assembly'
  | 'geyser-service-repair'
  | 'tile-grouting'
  | 'lights-installation'
  | 'booking-details'
  | 'address'
  | 'saved-addresses'
  | 'date-time'
  | 'checkout'
  | 'booking-confirmation'
  | 'my-bookings'
  | 'booking-detail'
  | 'service-category-detail'
  | 'create-project'
  | 'house-requirements'
  | 'review-requirements'
  | 'estimate-loading'
  | 'estimate-dashboard'
  | 'cost-breakdown'
  | 'material-estimate'
  | 'labour-estimate'
  | 'construction-stages'
  | 'cost-assumptions'
  | 'estimate-comparison'
  | 'estimate-revision'
  | 'final-estimate'
  | 'boq-overview'
  | 'detailed-boq'
  | 'boq-item-detail'
  | 'boq-edit'
  | 'boq-version-history'
  | 'material-calculator'
  | 'material-detail'
  | 'material-price-check'
  | 'upload-plan'
  | 'plan-analysis-loading'
  | 'plan-analysis-result'
  | 'plan-measurement'
  | 'plan-vs-estimate'
  | 'estimate-update'
  // ─── Houzeify 2.0 Module 01 — construction platform navigation ──────────
  // Company/partner primary-nav placeholders (constructionNav.ts's
  // COMPANY_NAV_ROUTES):
  | 'company-projects'
  | 'create-construction-project'
  | 'create-daily-progress'
  | 'company-progress'
  | 'site-operations'
  | 'workforce'
  | 'live-site'
  | 'company-documents'
  | 'company-reports'
  // Project-context nav placeholders (PROJECT_NAV_ROUTES):
  | 'project-timeline'
  | 'project-issues'
  | 'project-workforce'
  | 'project-live-site'
  | 'project-boq'
  | 'project-customer'
  | 'project-reports'
  | 'project-settings'
  // Customer-only nav placeholder (CUSTOMER_NAV_ROUTES):
  | 'project-photos'
  // Module 02 — Home Services hidden-navigation placeholder (see
  // homeownerDashboard.ts's DASHBOARD_ROUTES.homeServices):
  | 'home-services-coming-soon'

// ─── Dev screen switcher — jump straight to any screen for review ───────────
// Reads/writes `?screen=<id>` in the URL so any screen can be opened, shared,
// bookmarked, or reloaded without walking through splash → welcome → login
// every time.

const SCREEN_GROUPS: { label: string; screens: { id: AppScreen; label: string }[] }[] = [
  {
    label: 'Onboarding',
    screens: [
      { id: 'splash', label: 'Splash' },
      { id: 'welcome', label: 'Welcome' },
      { id: 'login', label: 'Login' },
      { id: 'otp', label: 'OTP' },
      { id: 'create-account', label: 'Create Account' },
      { id: 'account-created', label: 'Account Created' },
      { id: 'professional-type', label: 'Professional Type' },
      { id: 'professional-specialization', label: 'Professional Specialization' },
      { id: 'professional-profile-setup', label: 'Professional Profile Setup' },
      { id: 'onboarding-homeowner', label: 'Homeowner Onboarding' },
      { id: 'location-setup', label: 'Location Setup' },
      { id: 'home-intent', label: 'Home Intent' },
      { id: 'account-type', label: 'Individual vs Organization' },
      { id: 'create-organization', label: 'Create Organization' },
      { id: 'company-information', label: 'Company Information' },
      { id: 'business-verification', label: 'Business Verification' },
      { id: 'service-categories', label: 'Service Categories' },
      { id: 'service-locations', label: 'Service Locations' },
      { id: 'portfolio-setup', label: 'Portfolio Setup' },
      { id: 'company-profile', label: 'Company / Professional Profile' },
      { id: 'edit-services', label: 'Edit Services' },
      { id: 'edit-service-locations', label: 'Edit Service Locations' },
      { id: 'portfolio', label: 'Portfolio' },
      { id: 'add-portfolio-project', label: 'Add Portfolio Project' },
      { id: 'reviews-ratings', label: 'Reviews & Ratings' },
      { id: 'organization-settings', label: 'Organization Settings' },
      { id: 'team-management', label: 'Team Management' },
      { id: 'team-member-detail', label: 'Team Member Detail' },
      { id: 'roles-permissions', label: 'Roles & Permissions' },
      { id: 'organization-profile', label: 'Organization Profile' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'personal-profile', label: 'Personal Profile' },
      { id: 'preferences', label: 'Preferences' },
      { id: 'account-settings', label: 'Account Settings' },
      { id: 'plans-billing', label: 'Plans & Billing' },
      { id: 'team-setup', label: 'Team Setup' },
      { id: 'organization-submitted', label: 'Organization Submitted' },
    ],
  },
  {
    label: 'Renovate',
    screens: [
      { id: 'renovate-select-area', label: 'Renovate — Select Area' },
      { id: 'renovate-space-details', label: 'Renovate — Space Details' },
      { id: 'renovate-requirements', label: 'Renovate — Requirements' },
      { id: 'renovate-budget-timeline', label: 'Renovate — Budget & Timeline' },
      { id: 'renovate-upload', label: 'Renovate — Upload' },
      { id: 'renovate-review', label: 'Renovate — Review' },
      { id: 'renovate-ai-plan', label: 'Renovate — AI Plan' },
      { id: 'renovate-estimate', label: 'Renovate — Estimate' },
      { id: 'renovate-proceed', label: 'Renovate — Choose How to Proceed' },
      { id: 'renovate-packages', label: 'Renovate — Packages' },
      { id: 'renovate-professionals', label: 'Renovate — Professionals' },
      { id: 'renovate-custom-quote', label: 'Renovate — Custom Quote' },
      { id: 'renovate-selection-review', label: 'Renovate — Review Selection' },
      { id: 'renovate-book', label: 'Renovate — Book' },
      { id: 'renovate-project-created', label: 'Renovate — Project Created' },
    ],
  },
  {
    label: 'Core',
    screens: [
      { id: 'dashboard-home', label: 'Home Dashboard' },
      { id: 'build-or-improve', label: 'Build or Improve (chooser)' },
      { id: 'professional-dashboard', label: 'Professional Dashboard' },
      // Finding 4 fix (Task 9 round 1) — points at 'create-daily-progress'
      // now, not 'update-progress': UpdateProgressScreen.tsx's writes go to
      // the superseded projectProgress.ts store, which
      // ProjectProgressScreen.tsx (Task 6) no longer reads from. The route
      // itself stays registered/reachable-in-principle (matching this
      // codebase's "leave in place, superseded, not deleted" convention),
      // just no longer linked from here.
      { id: 'create-daily-progress', label: 'Update Progress' },
      { id: 'discover-projects', label: 'Discover Projects' },
      { id: 'project-opportunity-detail', label: 'Project Opportunity Detail' },
      { id: 'submit-bid', label: 'Submit Bid' },
      { id: 'bid-submitted', label: 'Bid Submitted' },
      { id: 'my-bids', label: 'My Bids' },
      { id: 'find-contractors', label: 'Find Contractors' },
      { id: 'contractor-profile', label: 'Contractor Profile' },
      { id: 'invite-contractor', label: 'Invite Contractor' },
      { id: 'bids-received', label: 'Bids Received' },
      { id: 'bid-detail', label: 'Bid Detail' },
      { id: 'compare-bids', label: 'Compare Bids' },
      { id: 'award-contractor', label: 'Award Contractor' },
      { id: 'contractor-selected', label: 'Contractor Selected' },
      { id: 'project-agreement', label: 'Project Agreement' },
      { id: 'review-accept-agreement', label: 'Review & Accept Agreement' },
      { id: 'payment-advance', label: 'Payment / Advance' },
      { id: 'project-workspace', label: 'Project Workspace' },
      { id: 'projects-list', label: 'Projects List' },
      { id: 'project-overview', label: 'Project Overview' },
      { id: 'project-team', label: 'Project Team' },
      { id: 'project-messages', label: 'Project Messages' },
      { id: 'project-documents', label: 'Project Documents' },
      { id: 'project-tasks', label: 'Project Tasks' },
      { id: 'project-progress', label: 'Project Progress' },
      { id: 'ai-advisor', label: 'AI Advisor' },
      { id: 'home-services', label: 'Home Services' },
      { id: 'hoziehelper-gold', label: 'HozieHelp Gold' },
      { id: 'hoziehelper-standard', label: 'HozieHelp Standard' },
      { id: 'salon-luxe', label: 'Salon Luxe' },
      { id: 'prime', label: 'Prime' },
      { id: 'spa-luxe', label: 'Spa Luxe' },
      { id: 'spa-prime', label: 'Spa Prime' },
      { id: 'spa-ayurveda', label: 'Spa Ayurveda' },
      { id: 'hair-studio-for-women', label: 'Hair Studio for Women' },
      { id: 'makeup-saree-styling', label: 'Makeup, Saree & Styling' },
      { id: 'salon-royale', label: 'Salon Royale' },
      { id: 'salon-prime', label: 'Salon Prime' },
      { id: 'massage-royale', label: 'Massage Royale' },
      { id: 'massage-prime', label: 'Massage Prime' },
      { id: 'massage-ayurveda', label: 'Massage Ayurveda' },
      { id: 'bathroom-cleaning', label: 'Bathroom Cleaning' },
      { id: 'kitchen-cleaning', label: 'Kitchen Cleaning' },
      { id: 'living-bedroom-cleaning', label: 'Living & Bedroom Cleaning' },
      { id: 'full-home-cleaning', label: 'Full Home/ By Room Cleaning' },
      { id: 'cockroach-control', label: 'Cockroach Control' },
      { id: 'termite-control', label: 'Termite Control' },
      { id: 'ants-bedbugs-control', label: 'Ants & Bed Bugs Control' },
      { id: 'wall-panels-installation', label: 'Wall Panels' },
      { id: 'painting-few-walls-rooms', label: 'Painting — Few Walls & Rooms' },
      { id: 'electrician', label: 'Electrician' },
      { id: 'plumbing', label: 'Plumbing' },
      { id: 'carpentry', label: 'Carpentry' },
      { id: 'civil-work', label: 'Civil Work' },
      { id: 'furniture-assembly', label: 'Furniture Assembly' },
      { id: 'geyser-service-repair', label: 'Geyser Service & Repair' },
      { id: 'tile-grouting', label: 'Tile Grouting' },
      { id: 'lights-installation', label: 'Lights Installation' },
      { id: 'booking-details', label: 'Booking Details' },
      { id: 'address', label: 'Address' },
      { id: 'saved-addresses', label: 'Saved Addresses' },
      { id: 'date-time', label: 'Date & Time' },
      { id: 'checkout', label: 'Checkout' },
      { id: 'booking-confirmation', label: 'Booking Confirmation' },
      { id: 'my-bookings', label: 'My Bookings' },
      { id: 'booking-detail', label: 'Booking Detail' },
      { id: 'service-category-detail', label: 'Service Category Detail' },
      { id: 'create-project', label: 'Create Project' },
      { id: 'house-requirements', label: 'House Requirements' },
      { id: 'review-requirements', label: 'Review Requirements' },
      { id: 'homeowner-profile', label: 'Homeowner Profile' },
    ],
  },
  {
    label: 'Estimate',
    screens: [
      { id: 'estimate-loading', label: 'Estimate Loading' },
      { id: 'estimate-dashboard', label: 'Construction Estimate' },
      { id: 'cost-breakdown', label: 'Cost Breakdown' },
      { id: 'material-estimate', label: 'Material Estimate' },
      { id: 'labour-estimate', label: 'Labour Estimate' },
      { id: 'construction-stages', label: 'Construction Stages' },
      { id: 'cost-assumptions', label: 'Cost Assumptions' },
      { id: 'estimate-comparison', label: 'Estimate Comparison' },
      { id: 'estimate-revision', label: 'Estimate Revision' },
      { id: 'final-estimate', label: 'Final Estimate' },
    ],
  },
  {
    label: 'BOQ',
    screens: [
      { id: 'boq-overview', label: 'BOQ Overview' },
      { id: 'detailed-boq', label: 'Detailed BOQ' },
      { id: 'boq-item-detail', label: 'BOQ Item Detail' },
      { id: 'boq-edit', label: 'BOQ Edit / Adjust' },
      { id: 'boq-version-history', label: 'BOQ Version History' },
    ],
  },
  {
    label: 'Tools',
    screens: [
      { id: 'material-calculator', label: 'Material Calculator' },
      { id: 'material-detail', label: 'Material Detail' },
      { id: 'material-price-check', label: 'Material Price Check' },
      { id: 'upload-plan', label: 'Upload Plan' },
      { id: 'plan-analysis-loading', label: 'Plan Analysis Loading' },
      { id: 'plan-analysis-result', label: 'Plan Analysis Result' },
      { id: 'plan-measurement', label: 'Plan Measurement' },
      { id: 'plan-vs-estimate', label: 'Plan vs Estimate' },
      { id: 'estimate-update', label: 'Estimate Update' },
    ],
  },
  {
    label: 'Construction Platform (new — Module 01)',
    screens: [
      { id: 'company-projects', label: 'Company — Projects' },
      { id: 'create-construction-project', label: 'Company — Create Project' },
      { id: 'create-daily-progress', label: 'Project — Add Daily Progress' },
      { id: 'company-progress', label: 'Company — Progress' },
      { id: 'site-operations', label: 'Company — Site Operations' },
      { id: 'workforce', label: 'Company — Workforce' },
      { id: 'live-site', label: 'Company — Live Site' },
      { id: 'company-documents', label: 'Company — Documents' },
      { id: 'company-reports', label: 'Company — Reports' },
      { id: 'project-timeline', label: 'Project — Timeline' },
      { id: 'project-issues', label: 'Project — Issues' },
      { id: 'project-workforce', label: 'Project — Workforce' },
      { id: 'project-live-site', label: 'Project — Live Site' },
      { id: 'project-boq', label: 'Project — Bill of Quantities' },
      { id: 'project-customer', label: 'Project — Customer' },
      { id: 'project-reports', label: 'Project — Reports' },
      { id: 'project-settings', label: 'Project — Settings' },
      { id: 'project-photos', label: 'Customer — Photos' },
      { id: 'home-services-coming-soon', label: 'Home Services (hidden — Coming Soon)' },
    ],
  },
]

const ALL_SCREEN_IDS = SCREEN_GROUPS.flatMap(g => g.screens.map(s => s.id))

// Developer tooling: the floating "Jump to screen" switcher and `?screen=` deep
// links bypass every client-side role guard, so they are on for `vite dev` and
// opt-in elsewhere via VITE_ENABLE_DEV_SCREEN_SWITCHER=true (see .env.example).
const DEV_SCREEN_TOOLS =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_SCREEN_SWITCHER === 'true'

function getInitialScreen(): AppScreen {
  if (typeof window === 'undefined' || !DEV_SCREEN_TOOLS) return 'splash'
  const param = new URLSearchParams(window.location.search).get('screen')
  return (ALL_SCREEN_IDS as string[]).includes(param ?? '') ? (param as AppScreen) : 'splash'
}

/** Screens that need a project_id for SubNav / workspace chrome to render. */
function screenNeedsDevProject(s: AppScreen): boolean {
  return (
    s === 'project-workspace' ||
    s === 'project-overview' ||
    s === 'project-progress' ||
    s === 'project-timeline' ||
    s === 'project-tasks' ||
    s === 'project-issues' ||
    s === 'project-workforce' ||
    s === 'project-documents' ||
    s === 'project-boq' ||
    s === 'project-team' ||
    s === 'project-customer' ||
    s === 'project-reports' ||
    s === 'project-live-site' ||
    s === 'project-settings' ||
    s === 'project-messages' ||
    s === 'project-photos' ||
    s === 'create-daily-progress'
  )
}

function screenNeedsDevPartner(s: AppScreen): boolean {
  return (
    screenNeedsDevProject(s) ||
    s === 'professional-dashboard' ||
    s === 'company-projects' ||
    s === 'company-progress' ||
    s === 'site-operations' ||
    s === 'workforce' ||
    s === 'company-documents' ||
    s === 'company-reports' ||
    s === 'live-site' ||
    s === 'create-construction-project' ||
    s === 'discover-projects' ||
    s === 'my-bids'
  )
}

/**
 * DEV deep-link seed — `?screen=` bypasses onboarding, but project SubNav and
 * partner rails still need role / project_id. Without this, refreshing
 * project-overview or professional-dashboard look blank or bounce to homeowner Home.
 */
function getDevDeepLinkSeed(screen: AppScreen): Record<string, string> {
  if (!DEV_SCREEN_TOOLS) return {}
  if (!screenNeedsDevPartner(screen) && !screenNeedsDevProject(screen)) return {}
  const seed: Record<string, string> = {
    role: 'professional',
    account_type: 'organization',
    professional_type: 'general-contractor',
  }
  if (screenNeedsDevProject(screen)) {
    seed.project_id = 'demo-project-preview'
    seed.project_name = 'Sample Construction Project'
    seed.project_stage = 'foundation'
    seed.property_type = 'House'
    seed.location = 'Hyderabad, Telangana'
  }
  return seed
}

// ─── Session persistence — Flow 05 (Partner Authentication & Entry) ────────
// projectData was pure in-memory React state with zero persistence: the
// `screen` id round-trips through the URL (getInitialScreen/syncScreenUrl
// above), but nothing else did, so refreshing mid-session silently reset
// `role`/`professionalType`/`accountType` back to the homeowner default —
// a real, pre-existing bug affecting BOTH personas equally (not something
// introduced for Partner), just newly relevant now that reaching Partner
// state depends on more than one click. sessionStorage (not localStorage —
// clears with the tab, not a fake "remember me" backend replacement) is the
// smallest fix: only the identity-critical fields below round-trip, never
// project/estimate/bid data, which stays exactly as ephemeral as it always
// was. This is a frontend session snapshot only — see the audit report's
// "Backend Preparation" section for what a real auth/session API replaces.
const SESSION_STORAGE_KEY = 'houzeify.session'
const SESSION_FIELDS = ['role', 'professional_type', 'professional_type_other', 'account_type'] as const

function readSessionSnapshot(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const snapshot: Record<string, string> = {}
    for (const field of SESSION_FIELDS) {
      const value = parsed[field]
      if (typeof value === 'string') snapshot[field] = value
    }
    return snapshot
  } catch {
    return {}
  }
}

function writeSessionSnapshot(data: Record<string, string>) {
  if (typeof window === 'undefined') return
  try {
    const snapshot: Record<string, string> = {}
    for (const field of SESSION_FIELDS) {
      if (data[field]) snapshot[field] = data[field]
    }
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // sessionStorage can throw in locked-down/private-browsing contexts —
    // the session simply doesn't survive a refresh there, same as before.
  }
}

function clearSessionSnapshot() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // no-op — see readSessionSnapshot's own try/catch note.
  }
}

const INITIAL_PROJECT_DATA: Record<string, string> = {
  property_type: 'House',
  location: 'Hyderabad, Telangana',
}

function syncScreenUrl(s: AppScreen) {
  if (typeof window === 'undefined' || !DEV_SCREEN_TOOLS) return
  const url = new URL(window.location.href)
  if (s === 'splash') url.searchParams.delete('screen')
  else url.searchParams.set('screen', s)
  window.history.replaceState({}, '', url)
}

function DevScreenSwitcher({ current, onJump }: { current: AppScreen; onJump: (s: AppScreen) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filteredGroups = SCREEN_GROUPS.map(g => ({
    ...g,
    screens: g.screens.filter(s => s.label.toLowerCase().includes(query.toLowerCase())),
  })).filter(g => g.screens.length > 0)

  return (
    <div style={{ position: 'fixed', bottom: 88, right: 16, zIndex: 9999, fontFamily: '"Inter Variable", sans-serif' }}>
      {open && (
        <div
          style={{
            position: 'absolute', bottom: 52, right: 0, width: 280, maxHeight: 420,
            backgroundColor: 'var(--hz-surface)', border: '1px solid var(--hz-border)', borderRadius: 14,
            boxShadow: '0 12px 40px rgba(36,35,38,0.18)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--hz-surface-muted)', flexShrink: 0 }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Jump to screen…"
              style={{
                width: '100%', height: 32, padding: '0 10px', borderRadius: 8, border: '1px solid var(--hz-border)',
                fontSize: 12.5, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ overflowY: 'auto', padding: '4px 0' }}>
            {filteredGroups.map(g => (
              <div key={g.label}>
                <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--hz-ink-subtle)', padding: '8px 12px 4px', fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
                  {g.label}
                </div>
                {g.screens.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { onJump(s.id); setOpen(false); setQuery('') }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', fontSize: 13,
                      border: 'none', cursor: 'pointer',
                      backgroundColor: current === s.id ? '#E9D8FD' : 'transparent',
                      color: current === s.id ? 'var(--hz-black)' : 'var(--hz-black)',
                      fontWeight: current === s.id ? 600 : 400,
                    }}
                    onMouseEnter={e => { if (current !== s.id) e.currentTarget.style.backgroundColor = 'var(--hz-border-strong)' }}
                    onMouseLeave={e => { if (current !== s.id) e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            ))}
            {filteredGroups.length === 0 && (
              <div style={{ padding: 16, fontSize: 12.5, color: 'var(--hz-ink-subtle)', textAlign: 'center' }}>No matching screen.</div>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Jump to screen"
        title="Jump to screen"
        style={{
          width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
          backgroundColor: '#ECFF77', color: 'var(--hz-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(233,216,253,0.35)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="5.5"/><line x1="12.2" y1="12.2" x2="16" y2="16"/>
        </svg>
      </button>
    </div>
  )
}

export default function App() {
  // 12F — real backend identity (see src/data/authState.tsx). Only
  // consumed here for the sign-out wiring below; nothing in 12F gates any
  // route on `auth.status`.
  const auth = useAuth()
  // 12G-C1 — real backend CustomerProfile (see
  // src/data/customerProfileState.tsx). Consumed here only to bridge a
  // successfully loaded/saved profile's identity fields into `projectData`
  // below, so the many existing screens that already read
  // projectData.full_name/preferred_name (Home, Services, AI Advisor, ...)
  // stay correct after a refresh, without each of them needing to know the
  // backend exists. HomeownerProfileScreen itself reads the richer
  // `useCustomerProfile()` value directly.
  const customerProfile = useCustomerProfile()
  // 12G-C2 — real backend PartnerProfile (see src/data/partnerProfileState.
  // tsx). Independent of customerProfile above — one authenticated User can
  // have both at once (the approved 12G-A/12G-B model), so this is a
  // sibling provider, never nested inside or merged with it. Consumed here
  // only to bridge into projectData.company_name below — the one existing
  // partner-identity field other screens (ProfessionalDashboardScreen's
  // greeting) already read, same as customerProfile's full_name/
  // preferred_name bridge, but completely separate: this effect never
  // touches full_name/preferred_name, and the customer bridge never
  // touches company_name.
  const partnerProfile = usePartnerProfile()
  // 12G-C3 — real backend Organization membership (see
  // src/data/organizationState.tsx). A third, separate identity domain
  // from both providers above — never merged. Consumed here only to
  // bridge the "current organization"'s real id into
  // projectData.organization_id below, so CompanyProfileScreen (081),
  // which is a pure read layer over projectData with no store of its own,
  // doesn't show "Profile not found" after a refresh just because
  // organization_id isn't one of the SESSION_FIELDS.
  const organizations = useOrganizations()
  // 12H-C — real backend House Requirements cache (see
  // src/data/houseRequirementsState.tsx). Consumed here only to trigger a
  // real fetch whenever the ambient current project changes — the fetch's
  // own success handler rehydrates the legacy houseRequirements.ts store
  // that `houseRequirementsForProject` below (and five other existing
  // screens — EstimateLoadingScreen, EstimateComparisonScreen,
  // EstimateRevisionScreen, ReviewRequirementsScreen, ProjectOverviewScreen)
  // already read synchronously and unchanged. This is the one seam that
  // makes those six call sites see real, backend-persisted data after a
  // refresh without any of them becoming async themselves.
  const houseRequirementsCache = useHouseRequirements()
  const [screen, setScreenState] = useState<AppScreen>(getInitialScreen)
  const [fading, setFading] = useState(false)
  const [phone, setPhone] = useState('98765 43210')
  const [projectData, setProjectData] = useState<Record<string, string>>(() => {
    const initialScreen = getInitialScreen()
    return {
      ...INITIAL_PROJECT_DATA,
      ...readSessionSnapshot(),
      ...getDevDeepLinkSeed(initialScreen),
    }
  })

  const setScreen = (s: AppScreen) => {
    setScreenState(s)
    syncScreenUrl(s)
  }

  // TABLE C — real post-auth routing. Splash is now the single place that
  // decides where an authenticated visitor lands, on both a fresh OTP
  // login (OtpScreen navigates here on success) and a page refresh
  // (getInitialScreen() always starts production at 'splash' — see its
  // own comment). Previously this effect only ever timed out to
  // 'welcome', so a returning user with a fully valid session cookie
  // still dead-ended at the marketing page, and OtpScreen separately
  // forced every login through the fake 'create-account' step regardless
  // of whether the user already had a profile.
  useEffect(() => {
    if (screen !== 'splash') return

    if (auth.status === 'loading') return // wait for the GET /auth/me bootstrap

    if (auth.status !== 'authenticated') {
      // Unchanged from before TABLE C: the timed fade into the marketing page.
      const t1 = setTimeout(() => setFading(true), 2600)
      const t2 = setTimeout(() => setScreen('welcome'), 3000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }

    const stillResolving =
      customerProfile.status === 'idle' || customerProfile.status === 'loading' ||
      partnerProfile.status === 'idle' || partnerProfile.status === 'loading'

    if (stillResolving) {
      // Bounded wait — a network hang must never strand an authenticated
      // user on the splash screen forever.
      const t = setTimeout(() => setScreen('welcome'), 6000)
      return () => clearTimeout(t)
    }

    // Both profile providers are resolved: route straight to the real
    // destination, skipping 'welcome' and 'create-account' entirely.
    // 'error' is treated the same as 'not-found' for routing purposes
    // only — the destination screen still surfaces its own real error.
    const destination: AppScreen =
      customerProfile.status === 'loaded' ? 'dashboard-home' :
      partnerProfile.status === 'loaded' ? 'professional-dashboard' :
      'account-created'
    const t = setTimeout(() => setScreen(destination), 900)
    return () => clearTimeout(t)
  }, [screen, auth.status, customerProfile.status, partnerProfile.status])

  // Persists the identity-critical fields on every change so a refresh
  // mid-session doesn't silently drop back to the homeowner default (see
  // the Session persistence comment above getInitialScreen).
  useEffect(() => {
    writeSessionSnapshot(projectData)
  }, [projectData.role, projectData.professional_type, projectData.professional_type_other, projectData.account_type])

  // 12G-D — cross-user identity-leak guard. The normal "switch account"
  // path (Sign Out -> navigateTo('welcome')) already resets projectData
  // explicitly (see the 'welcome' branch in navigateTo below). But a real,
  // live-tested gap remained: a fresh OTP login that lands OVER a still-
  // valid stale session cookie for a *different* user — e.g. a browser
  // that never explicitly signed out — authenticates as the new user
  // (auth.user.id changes) without ever routing through 'welcome', so
  // projectData's stale full_name/company_name/organization_id etc. from
  // the previous real user would otherwise keep showing under the new
  // user's real session until every field happened to be overwritten.
  // This mirrors the Sign Out reset, triggered by the authenticated
  // identity itself changing rather than by that one navigation path.
  const previousAuthUserIdRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    const currentId = auth.user?.id
    const previousId = previousAuthUserIdRef.current
    if (previousId && currentId && previousId !== currentId) {
      clearSessionSnapshot()
      setProjectData(INITIAL_PROJECT_DATA)
    }
    previousAuthUserIdRef.current = currentId
  }, [auth.user?.id])

  // 12H-C — whenever the ambient current project changes, ensure its real
  // House Requirements are fetched (if not already cached/in flight). A
  // no-op once loaded/not-found for this project id, so safe to run on
  // every render this dependency changes. See houseRequirementsCache's own
  // declaration comment above for why this is the one thing that keeps the
  // legacy synchronous store real after a refresh.
  useEffect(() => {
    if (projectData.project_id) houseRequirementsCache.ensureLoaded(projectData.project_id)
  }, [projectData.project_id, houseRequirementsCache])

  // 12G-C1 — once the real backend CustomerProfile finishes loading (e.g.
  // right after a browser refresh, when projectData.full_name/preferred_name
  // are back to empty since neither is in SESSION_FIELDS), sync its
  // identity fields into projectData so every legacy screen that already
  // reads projectData.full_name/preferred_name keeps showing the real,
  // persisted name — never overwritten backward by stale projectData, and
  // never touched at all for a 'not-found'/'error'/still-loading profile
  // (those states must not blank out whatever projectData already has,
  // e.g. a name just typed into onboarding this same session but not yet
  // saved). One-directional: backend -> projectData, never the reverse.
  useEffect(() => {
    if (customerProfile.status !== 'loaded' || !customerProfile.profile) return
    const { fullName, preferredName } = customerProfile.profile
    setProjectData(prev => {
      if (prev.full_name === fullName && prev.preferred_name === (preferredName ?? prev.preferred_name)) return prev
      return { ...prev, full_name: fullName, ...(preferredName ? { preferred_name: preferredName } : {}) }
    })
  }, [customerProfile.status, customerProfile.profile])

  // 12G-C2 — same pattern, completely separate field: once the real
  // backend PartnerProfile loads, sync its display identity into
  // projectData.company_name — the one existing key
  // ProfessionalDashboardScreen's greeting already reads (set today by
  // ProfessionalProfileSetupScreen's own local-fixture save, which stays
  // untouched; this just keeps it correct after a refresh, when
  // company_name isn't in SESSION_FIELDS either). Never writes
  // full_name/preferred_name — CustomerProfile and PartnerProfile are
  // separate identity domains and must never cross-contaminate projectData.
  useEffect(() => {
    if (partnerProfile.status !== 'loaded' || !partnerProfile.profile) return
    const companyName = partnerProfile.profile.displayName || partnerProfile.profile.fullName
    setProjectData(prev => (prev.company_name === companyName ? prev : { ...prev, company_name: companyName }))
  }, [partnerProfile.status, partnerProfile.profile])

  // TABLE C follow-up — restore the canonical `role` for a returning
  // professional. Before TABLE C, every login passed through
  // AccountCreatedScreen, which set `role` explicitly; TABLE C's real
  // post-auth routing sends a returning user with a PartnerProfile straight
  // to their dashboard instead, so nothing set `role` any more. It then fell
  // back to the homeowner default, and every company screen that guards on
  // role === 'professional' bounced the user to the homeowner dashboard
  // (CompanyProjectsListScreen's own redirect is the one that made this
  // visible: a real company user could not reach their own Projects list).
  // This was masked in testing because `role` IS in SESSION_FIELDS, so it
  // survives a refresh — only a genuinely new browser session loses it.
  //
  // Same bridge pattern as company_name above: restores a real, already-
  // persisted backend fact, never fabricates one. Deliberately narrow, and
  // mirrors the splash router's own precedence (a CustomerProfile wins):
  //   - waits until BOTH profile lookups have resolved, so it never acts on
  //     a half-loaded state;
  //   - a user with a CustomerProfile keeps the homeowner role the router
  //     sends them to, even if they also have a PartnerProfile;
  //   - only ever writes 'professional', never 'homeowner' — so an explicit
  //     choice already in projectData is never overwritten by this bridge.
  useEffect(() => {
    if (partnerProfile.status !== 'loaded') return
    const customerResolved =
      customerProfile.status === 'loaded' ||
      customerProfile.status === 'not-found' ||
      customerProfile.status === 'error'
    if (!customerResolved) return
    if (customerProfile.status === 'loaded') return
    setProjectData(prev => (prev.role === 'professional' ? prev : { ...prev, role: 'professional' }))
  }, [partnerProfile.status, customerProfile.status])

  // 12G-C3 — once the real backend Organization list finishes loading,
  // sync the resolved "current organization"'s real id into
  // projectData.organization_id, the one key every organization-scoped
  // screen (CompanyProfileScreen, EditServicesScreen, TeamSetupScreen, ...)
  // already reads — this only restores it after a refresh; it never
  // fabricates one. Deliberately narrow: this bridge touches
  // organization_id ONLY, never projectData.location/company_owner/etc. —
  // those fields have no unambiguous backend source (location in
  // particular is a shared key also used by the homeowner location-setup
  // flow, and overwriting it here for a dual-identity user would be
  // exactly the cross-domain contamination this bridge pattern exists to
  // avoid), so they remain session-ephemeral after a refresh, same as
  // before this phase — a pre-existing limitation, not fixed here.
  useEffect(() => {
    if (organizations.status !== 'loaded' || !organizations.currentOrganization) return
    const orgId = organizations.currentOrganization.id
    setProjectData(prev => (prev.organization_id === orgId ? prev : { ...prev, organization_id: orgId }))
  }, [organizations.status, organizations.currentOrganization])

  const navigateTo = (s: string, data?: Record<string, string>) => {
    if (data?.phone) setPhone(data.phone)
    // 'welcome' is the pre-auth landing screen — arriving there (via an
    // explicit Sign Out, or otherwise) always means no active identity.
    // Previously nothing cleared projectData on sign-out, so logging back
    // in as a *different* persona could silently inherit the prior
    // session's role/professionalType. Resets to the same defaults the app
    // boots with, then applies this navigation's own data on top (matters
    // for LoginScreen-style calls that pass `{ phone }` alongside 'welcome'
    // in the same call, though today none do).
    if (s === 'welcome') {
      // 'welcome' is also the single existing Sign Out destination (all
      // three call sites — HomeownerProfileScreen, AccountSettingsScreen,
      // ProfessionalDashboardScreen — already navigate here and nowhere
      // else on sign-out). Revoking the real backend session belongs
      // exactly here, once, rather than duplicated into each screen.
      // Best-effort/fire-and-forget — see authState.tsx's logout() for why
      // the local sign-out always proceeds even if this call fails.
      void auth.logout()
      clearSessionSnapshot()
      setProjectData({ ...INITIAL_PROJECT_DATA, ...data })
    } else if (data) {
      setProjectData(prev => ({ ...prev, ...data }))
    }
    setScreen(s as AppScreen)
  }

  // ─── Canonical user role ──────────────────────────────────────────────
  // role is the single top-level persona ('homeowner' | 'professional'),
  // set explicitly the moment a session picks a path (AccountCreatedScreen's
  // default homeowner CTA vs its "I'm a professional / business" link — the
  // former Screen 007 PrimaryIntentScreen fork was removed as an orphaned,
  // no-longer-reachable step) and read here by every screen that needs to
  // know which dashboard/flow to use. professionalType, accountType and
  // primaryIntent remain untouched for their own existing purposes — never
  // a substitute for role.
  //
  // resolvedRole is computed synchronously every render (so consumers never
  // see a stale/undefined role even before the persistence effect below has
  // run) via resolveUserRole's migration-only fallback for sessions that
  // reached this state before `role` existed.
  const resolvedRole = resolveUserRole(projectData.role, projectData.primary_intent, projectData.professional_type)

  useEffect(() => {
    if (projectData.role !== resolvedRole) {
      setProjectData(prev => ({ ...prev, role: resolvedRole }))
    }
  }, [resolvedRole, projectData.role])

  // ─── Batch A — real home location ──────────────────────────────────────
  // Screen 010 (LocationSetupScreen) is the one place a homeowner's real
  // location is collected — it forwards location_id/city/state/... into
  // projectData, but never a plain `location` string, which stays on
  // App.tsx's own hardcoded demo default ('Hyderabad, Telangana') for the
  // entire session unless a PROFESSIONAL screen (021/022/024/025/...)
  // separately sets it for its own, unrelated purpose. resolvedLocation
  // prefers the real city/state whenever Location Setup was actually
  // completed (signaled by location_id + city both being present), and
  // otherwise passes projectData.location through completely unchanged —
  // the same value every professional screen and direct/dev access already
  // correctly relies on. A derived read only; never written back into
  // projectData, never a second source of truth.
  const resolvedLocation = projectData.location_id && projectData.city
    ? [projectData.city, projectData.state].filter(Boolean).join(', ')
    : projectData.location

  // ─── Batch A — real home type → Create Project's property type ────────
  // Screen 011 (ConstructionIntentScreen) collects a real home_type
  // ('independent-house' | 'villa' | 'apartment' | 'extension' | 'other'),
  // but Screen 035 (CreateProjectScreen) reads a different, never-populated
  // key (`property_type`) using its own separate taxonomy ('House' |
  // 'Villa' | 'Farmhouse' | 'Apartment' | 'Other'). Four of the five
  // home_type values map unambiguously; 'extension' describes a project
  // intent ("I'm extending my existing home"), not a property type, and has
  // no safe equivalent in 035's taxonomy — it is deliberately left
  // unmapped rather than guessed, and falls through to the existing
  // projectData.property_type default exactly as before.
  const HOME_TYPE_TO_PROPERTY_TYPE: Partial<Record<string, string>> = {
    'independent-house': 'House',
    villa: 'Villa',
    duplex: 'Duplex',
    apartment: 'Apartment',
    other: 'Other',
  }
  const resolvedPropertyType =
    (projectData.home_type && HOME_TYPE_TO_PROPERTY_TYPE[projectData.home_type]) || projectData.property_type

  // ─── Real built-up area → Estimate/BOQ/Material screens ────────────────
  // Customer bugfix — every one of these screens belongs to the New Build
  // flow (Create Project → House Requirements → Estimate), whose real
  // built-up area is HouseRequirementsScreen's own `builtUpArea` field —
  // saved via createHouseRequirements() into houseRequirements.ts's
  // project-scoped store, never into projectData. The previous version of
  // this constant read `projectData.home_built_up_area` instead — a field
  // only ConstructionIntentScreen (Screen 011, a different onboarding step)
  // and the unrelated Renovation flow ever write — so for every New Build
  // project it stayed undefined and every Estimate screen silently fell
  // back to its own hardcoded '2,400 sq ft' demo default regardless of
  // what the homeowner actually entered. Prefer the real, project-scoped
  // House Requirements value; keep the old projectData field as a
  // secondary fallback (still real data, just from a different flow) for
  // any homeowner who reaches these screens without a House Requirements
  // record; undefined (not a stale default) only when neither exists, so
  // each screen's own existing fallback still applies exactly as before —
  // same honest, read-only, derived-only pattern as resolvedLocation/
  // resolvedPropertyType above.
  const houseRequirementsForProject = projectData.project_id ? getHouseRequirementsForProject(projectData.project_id) : undefined
  const resolvedBuiltUpArea = houseRequirementsForProject?.builtUpArea
    ? `${houseRequirementsForProject.builtUpArea.toLocaleString('en-IN')} sq ft`
    : projectData.home_built_up_area?.trim()
      ? `${projectData.home_built_up_area.trim()} sq ft`
      : undefined

  const slide = {
    position: 'absolute' as const,
    inset: 0,
    animation: 'splashFadeIn 0.4s ease-out both',
  }

  return (
    <CustomerCartProvider>
    <CustomerAddressProvider>
    <SubscriptionProvider role={resolvedRole}>
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {screen === 'splash' && (
        <div style={{ position: 'absolute', inset: 0, opacity: fading ? 0 : 1, transition: 'opacity 0.4s ease-out' }}>
          <HouzeifySplashPage />
        </div>
      )}
      {screen === 'welcome' && (
        <div style={slide}>
          <WelcomeScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'login' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <LoginScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'otp' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <OtpScreen phone={phone} onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'create-account' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CreateAccountScreen phone={phone} onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'account-created' && (
        <div style={slide}>
          <AccountCreatedScreen onNavigate={navigateTo} fullName={projectData.full_name} />
        </div>
      )}
      {screen === 'build-or-improve' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <BuildOrImproveScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'renovate-select-area' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateSelectAreaScreen onNavigate={navigateTo} initialAreas={projectData.renovation_areas} />
        </div>
      )}
      {screen === 'renovate-space-details' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateSpaceDetailsScreen
            onNavigate={navigateTo}
            renovationAreas={projectData.renovation_areas}
            initialLocation={resolvedLocation}
            initialPropertyType={resolvedPropertyType}
            initialBuiltUpArea={resolvedBuiltUpArea}
          />
        </div>
      )}
      {screen === 'renovate-requirements' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateRequirementsScreen
            onNavigate={navigateTo}
            initialGoal={projectData.renovation_goal}
            initialTags={projectData.renovation_requirement_tags}
          />
        </div>
      )}
      {screen === 'renovate-budget-timeline' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateBudgetTimelineScreen
            onNavigate={navigateTo}
            initialBudget={projectData.renovation_budget_range}
            initialCustomBudget={projectData.renovation_budget_custom}
            initialTimeline={projectData.renovation_timeline}
            initialFinish={projectData.renovation_finish}
          />
        </div>
      )}
      {screen === 'renovate-upload' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateUploadScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'renovate-review' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateReviewScreen
            onNavigate={navigateTo}
            renovationAreas={projectData.renovation_areas}
            location={projectData.location}
            builtUpArea={projectData.home_built_up_area}
            budgetRange={projectData.renovation_budget_range}
            budgetCustom={projectData.renovation_budget_custom}
            finish={projectData.renovation_finish}
            goal={projectData.renovation_goal}
            requirementTags={projectData.renovation_requirement_tags}
            photosCount={projectData.renovation_photos_count}
          />
        </div>
      )}
      {screen === 'renovate-ai-plan' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateAIPlanScreen
            onNavigate={navigateTo}
            renovationAreas={projectData.renovation_areas}
            goal={projectData.renovation_goal}
            requirementTags={projectData.renovation_requirement_tags}
            finish={projectData.renovation_finish}
          />
        </div>
      )}
      {screen === 'renovate-estimate' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateEstimateScreen
            onNavigate={navigateTo}
            budgetRange={projectData.renovation_budget_range}
            budgetCustom={projectData.renovation_budget_custom}
            finish={projectData.renovation_finish}
          />
        </div>
      )}
      {screen === 'renovate-proceed' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateProceedScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'renovate-packages' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovatePackagesScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'renovate-professionals' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateProfessionalsScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'renovate-custom-quote' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateCustomQuoteScreen
            onNavigate={navigateTo}
            renovationAreas={projectData.renovation_areas}
            location={projectData.location}
            builtUpArea={projectData.home_built_up_area}
            estimateMin={projectData.renovation_estimate_min}
            estimateMax={projectData.renovation_estimate_max}
            finish={projectData.renovation_finish}
          />
        </div>
      )}
      {screen === 'renovate-selection-review' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateSelectionReviewScreen
            onNavigate={navigateTo}
            packageId={projectData.renovation_package_id}
            professionalId={projectData.renovation_professional_id}
            isCustomProposal={projectData.renovation_custom_proposal}
            customPrice={projectData.renovation_selection_price}
          />
        </div>
      )}
      {screen === 'renovate-book' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateBookScreen
            onNavigate={navigateTo}
            selectionTitle={projectData.renovation_selection_title}
            selectionPrice={projectData.renovation_selection_price}
            selectionTimeline={projectData.renovation_selection_timeline}
          />
        </div>
      )}
      {screen === 'renovate-project-created' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RenovateProjectCreatedScreen
            onNavigate={navigateTo}
            selectionTitle={projectData.renovation_selection_title}
            selectionPrice={projectData.renovation_selection_price}
            selectionTimeline={projectData.renovation_selection_timeline}
            bookDate={projectData.renovation_book_date}
            location={resolvedLocation}
            renovationAreas={projectData.renovation_areas}
          />
        </div>
      )}
      {screen === 'professional-type' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProfessionalTypeScreen
            onNavigate={navigateTo}
            accountType={projectData.account_type}
            companyName={projectData.company_name}
          />
        </div>
      )}
      {screen === 'professional-specialization' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProfessionalSpecializationScreen
            onNavigate={navigateTo}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
          />
        </div>
      )}
      {screen === 'professional-profile-setup' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProfessionalProfileSetupScreen
            onNavigate={navigateTo}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            organizationId={projectData.organization_id}
            organizationName={projectData.organization_name}
            location={projectData.location}
          />
        </div>
      )}
      {/* 12G-D — real onboarding name only (projectData.full_name), same
          "09B" precedent as Home/AI Advisor below; no hardcoded
          homeownerProfile fallback. HomeownerOnboardingScreen's own
          `initialName ?? ''` already starts the field genuinely empty when
          this is absent — never a stranger's name in an editable field. */}
      {screen === 'onboarding-homeowner' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <HomeownerOnboardingScreen
            primaryIntent={projectData.primary_intent}
            serviceEntry={projectData.service_entry}
            initialName={projectData.full_name}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'location-setup' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <LocationSetupScreen primaryIntent={projectData.primary_intent} onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'home-intent' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ConstructionIntentScreen
            primaryIntent={projectData.primary_intent}
            constructionStage={projectData.construction_stage}
            homeType={projectData.home_type}
            homeBHK={projectData.home_bhk}
            homeBuiltUpArea={projectData.home_built_up_area}
            homeFloorCount={projectData.home_floor_count}
            serviceCategory={projectData.service_category}
            serviceEntry={projectData.service_entry}
            location={projectData.city}
            signupFlow={projectData.signup_flow}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'account-type' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <AccountTypeScreen
            onNavigate={navigateTo}
            role={resolvedRole}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
          />
        </div>
      )}
      {screen === 'create-organization' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CreateOrganizationScreen
            onNavigate={navigateTo}
            initialName={projectData.organization_name}
            initialOwnerName={projectData.company_owner}
            initialLocation={projectData.location}
            initialLogoUrl={projectData.logo_url}
            existingOrganizationId={projectData.organization_id}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
          />
        </div>
      )}
      {screen === 'company-information' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CompanyInformationScreen
            organizationId={projectData.organization_id}
            initialCompanyName={projectData.organization_name}
            initialOwnerName={projectData.company_owner}
            initialLocation={projectData.location}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'business-verification' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <BusinessVerificationScreen
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            companyOwnerName={projectData.company_owner}
            companyType={projectData.company_type}
            location={projectData.location}
            phone={projectData.phone}
            email={projectData.email}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'service-categories' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ServiceCategoriesScreen
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            companyType={projectData.company_type}
            location={projectData.location}
            verificationStatus={projectData.verification_status}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            specialization={projectData.specialization}
            specializationOther={projectData.specialization_other}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'service-locations' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ServiceLocationsScreen
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            companyLocation={projectData.location}
            primaryService={projectData.primary_service}
            serviceCategories={projectData.service_categories}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            existingServiceLocations={projectData.service_locations}
            existingCoverageType={projectData.coverage_type}
            existingPrimaryLocation={projectData.primary_location}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'portfolio-setup' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <PortfolioSetupScreen
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            companyLocation={projectData.location}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            serviceCategories={projectData.service_categories}
            primaryService={projectData.primary_service}
            serviceLocations={projectData.service_locations}
            primaryLocation={projectData.primary_location}
            coverageType={projectData.coverage_type}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'team-setup' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <TeamSetupScreen organizationId={projectData.organization_id} companyName={projectData.company_name} companyOwnerName={projectData.company_owner} onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'organization-submitted' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <OrganizationSubmittedScreen
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            companyOwnerName={projectData.company_owner}
            companyType={projectData.company_type}
            location={projectData.location}
            verificationStatus={projectData.verification_status}
            portfolioProjectCount={projectData.portfolio_project_count}
            invitedCount={projectData.invited_count}
            serviceLocations={projectData.service_locations}
            coverageType={projectData.coverage_type}
            professionalType={projectData.professional_type}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'homeowner-profile' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <HomeownerProfileScreen
            onboardingFlow={projectData.onboarding_flow}
            fullName={projectData.full_name}
            preferredName={projectData.preferred_name}
            location={projectData.location_id ? [projectData.city, projectData.state].filter(Boolean).join(', ') : undefined}
            email={projectData.email}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {/* Customer Implementation 09B — Home receives the real onboarding name
          only (projectData.full_name), never the hardcoded homeownerProfile
          fallback that reintroduced "Adarsh Kiran" on fresh sessions; Home
          derives a neutral greeting/avatar when it's absent. */}
      {screen === 'dashboard-home' && (
        <div style={{ ...slide }}>
          <HomeDashboardScreen
            onNavigate={navigateTo}
            role={resolvedRole}
            primaryIntent={projectData.primary_intent}
            preferredName={projectData.preferred_name}
            fullName={projectData.full_name}
            city={projectData.city}
            state={projectData.state}
            projectName={projectData.project_name}
            projectLocation={resolvedLocation}
            projectStage={projectData.project_stage}
            projectId={projectData.project_id}
            homeType={projectData.home_type}
            constructionStage={projectData.construction_stage}
            homeBHK={projectData.home_bhk}
            homeBuiltUpArea={projectData.home_built_up_area}
            homeFloorCount={projectData.home_floor_count}
            serviceEntry={projectData.service_entry}
          />
        </div>
      )}
      {screen === 'professional-dashboard' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProfessionalDashboardScreen
            role={resolvedRole}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            location={projectData.location}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            specialization={projectData.specialization}
            specializationOther={projectData.specialization_other}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            invitedCount={projectData.invited_count}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'company-profile' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CompanyProfileScreen
            role={resolvedRole}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            companyOwnerName={projectData.company_owner}
            location={projectData.location}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            yearsInBusiness={projectData.years_in_business}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            serviceDescription={projectData.service_description}
            portfolioProjectCount={projectData.portfolio_project_count}
            invitedCount={projectData.invited_count}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'edit-services' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <EditServicesScreen
            role={resolvedRole}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            location={projectData.location}
            serviceCategories={projectData.service_categories}
            primaryService={projectData.primary_service}
            serviceDescription={projectData.service_description}
            serviceAreaType={projectData.service_area_type}
            yearsInBusiness={projectData.years_in_business}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'edit-service-locations' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <EditServiceLocationsScreen
            role={resolvedRole}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            location={projectData.location}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            coverageType={projectData.coverage_type}
            primaryLocation={projectData.primary_location}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'portfolio' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <PortfolioScreen
            role={resolvedRole}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            location={projectData.location}
            serviceCategories={projectData.service_categories}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'add-portfolio-project' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <AddPortfolioProjectScreen
            role={resolvedRole}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            location={projectData.location}
            serviceCategories={projectData.service_categories}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'reviews-ratings' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ReviewsRatingsScreen
            role={resolvedRole}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            location={projectData.location}
            serviceCategories={projectData.service_categories}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'organization-settings' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <OrganizationSettingsScreen
            role={resolvedRole}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            companyOwner={projectData.company_owner}
            companyType={projectData.company_type}
            location={projectData.location}
            phone={projectData.phone}
            email={projectData.email}
            website={projectData.website}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'team-management' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <TeamManagementScreen
            role={resolvedRole}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            companyOwner={projectData.company_owner}
            invitedCount={projectData.invited_count}
            invitedEmails={projectData.invited_emails}
            teamSummary={projectData.team_summary}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'team-member-detail' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <TeamMemberDetailScreen
            role={resolvedRole}
            companyName={projectData.company_name}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'roles-permissions' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <RolesPermissionsScreen
            role={resolvedRole}
            companyName={projectData.company_name}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'organization-profile' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <OrganizationProfileScreen
            role={resolvedRole}
            accountType={projectData.account_type}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            logoUrl={projectData.logo_url}
            location={projectData.location}
            companyOwner={projectData.company_owner}
            organizationType={projectData.organization_type}
            about={projectData.about}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'notifications' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <NotificationsScreen
            role={resolvedRole}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'account-settings' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <AccountSettingsScreen
            role={resolvedRole}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'plans-billing' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <PlansBillingScreen
            role={resolvedRole}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'preferences' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <PreferencesScreen
            role={resolvedRole}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'personal-profile' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <PersonalProfileScreen
            role={resolvedRole}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'discover-projects' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <DiscoverProjectsScreen
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            role={resolvedRole}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-opportunity-detail' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectOpportunityDetailScreen
            opportunityId={projectData.opportunity_id}
            role={resolvedRole}
            professionalType={projectData.professional_type}
            professionalTypeOther={projectData.professional_type_other}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'submit-bid' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <SubmitBidScreen
            opportunityId={projectData.opportunity_id}
            invitationId={projectData.invitation_id}
            projectName={projectData.project_name}
            propertyType={projectData.property_type}
            location={projectData.location}
            role={resolvedRole}
            organizationId={projectData.organization_id}
            accountType={projectData.account_type}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'bid-submitted' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <BidSubmittedScreen
            bidId={projectData.bid_id}
            role={resolvedRole}
            companyName={projectData.company_name}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'my-bids' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <MyBidsScreen
            role={resolvedRole}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {/* Houzeify 2.0 Module 03 — real company Projects List, replacing the
          Module 01 ComingSoonScreen placeholder now that an organization-
          scoped project backend exists. */}
      {screen === 'company-projects' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CompanyProjectsListScreen role={resolvedRole} onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'create-construction-project' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CreateConstructionProjectScreen role={resolvedRole} onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'create-daily-progress' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CreateDailyProgressScreen
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            currentStage={projectData.project_stage}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {/* Houzeify 2.0 Module 01 — company/partner primary-nav placeholders.
          Every PartnerNavRail item without a real screen yet routes here
          (never a dead '' stub) — see constructionNav.ts's COMPANY_NAV_ROUTES
          and NAV_PLACEHOLDER_CONTENT. */}
      {screen === 'company-progress' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CompanyProgressScreen role={resolvedRole} onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'company-reports' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CompanyReportsScreen role={resolvedRole} onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'workforce' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CompanyWorkforceScreen role={resolvedRole} onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'company-documents' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CompanyDocumentsScreen role={resolvedRole} onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'site-operations' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CompanyOpenWorkScreen role={resolvedRole} onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'live-site' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          {/* S18 — KEEP COMING SOON until camera/storage architecture exists. */}
          <ComingSoonScreen
            placeholderId={screen}
            shell="company"
            activeCompanyId="live-site"
            organizationId={projectData.organization_id}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'find-contractors' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <FindContractorsScreen
            role={resolvedRole}
            primaryIntent={projectData.primary_intent}
            projectName={projectData.project_name}
            projectLocation={projectData.location}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            location={projectData.location}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'contractor-profile' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ContractorProfileScreen
            role={resolvedRole}
            professionalId={projectData.professional_id}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            location={projectData.location}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            yearsInBusiness={projectData.years_in_business}
            logoUrl={projectData.logo_url}
            primaryIntent={projectData.primary_intent}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'invite-contractor' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <InviteContractorScreen
            role={resolvedRole}
            professionalId={projectData.professional_id}
            organizationId={projectData.organization_id}
            projectId={projectData.project_id}
            companyName={projectData.company_name}
            location={projectData.location}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            projectName={projectData.project_name}
            propertyType={projectData.property_type}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'bids-received' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <BidsReceivedScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            propertyType={projectData.property_type}
            location={projectData.location}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'bid-detail' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <BidDetailScreen
            role={resolvedRole}
            bidId={projectData.bid_id}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            propertyType={projectData.property_type}
            location={projectData.location}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'compare-bids' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CompareBidsScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            propertyType={projectData.property_type}
            location={projectData.location}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'award-contractor' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <AwardContractorScreen
            role={resolvedRole}
            bidId={projectData.bid_id}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            propertyType={projectData.property_type}
            location={projectData.location}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'contractor-selected' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ContractorSelectedScreen
            role={resolvedRole}
            bidId={projectData.bid_id}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            propertyType={projectData.property_type}
            location={projectData.location}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-agreement' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectAgreementScreen
            onNavigate={navigateTo}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            fullName={projectData.full_name}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            location={projectData.location}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
          />
        </div>
      )}
      {screen === 'review-accept-agreement' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ReviewAcceptAgreementScreen
            onNavigate={navigateTo}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
          />
        </div>
      )}
      {screen === 'payment-advance' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <PaymentAdvanceScreen
            onNavigate={navigateTo}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
          />
        </div>
      )}
      {screen === 'project-workspace' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectWorkspaceScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            projectType={projectData.project_type}
            propertyType={projectData.property_type}
            location={projectData.location}
            projectStage={projectData.project_stage}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'projects-list' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectsListScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'project-overview' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectOverviewScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            propertyType={projectData.property_type}
            location={projectData.location}
            projectStage={projectData.project_stage}
            projectStatus={projectData.project_status}
            timelineStart={projectData.timeline_start}
            timelineCompletion={projectData.timeline_completion}
            summary={projectData.summary}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-team' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectTeamScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            propertyType={projectData.property_type}
            location={projectData.location}
            projectStage={projectData.project_stage}
            fullName={projectData.full_name}
            preferredName={projectData.preferred_name}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-messages' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectMessagesScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            location={projectData.location}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-documents' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectDocumentsScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            location={projectData.location}
            fullName={projectData.full_name}
            preferredName={projectData.preferred_name}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-boq' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectBoqScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            location={projectData.location}
            fullName={projectData.full_name}
            preferredName={projectData.preferred_name}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-tasks' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectTasksScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            location={projectData.location}
            fullName={projectData.full_name}
            preferredName={projectData.preferred_name}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-issues' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectIssuesScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            location={projectData.location}
            fullName={projectData.full_name}
            preferredName={projectData.preferred_name}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-progress' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectProgressScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            location={projectData.location}
            projectStage={projectData.project_stage}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-workforce' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectWorkforceScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            location={projectData.location}
            fullName={projectData.full_name}
            preferredName={projectData.preferred_name}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {/* Houzeify 2.0 Module 01 — project-context nav placeholders. Every
          ProjectSubNav tab without a real screen yet routes here (see
          constructionNav.ts's PROJECT_NAV_ROUTES / NAV_PLACEHOLDER_CONTENT).
          Reachable from both the project sub-screens' own ProjectSubNav and
          the customer Sidebar's new Timeline/Live Site items. */}
      {screen === 'project-live-site' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          {/* S18 — KEEP COMING SOON; Daily Progress photos ≠ Live Site. */}
          <ComingSoonScreen
            placeholderId="project-live-site"
            shell="project"
            activeProjectId="liveSite"
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-settings' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectSettingsScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-reports' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectConstructionRecordScreen
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            role={resolvedRole}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {/* Houzeify 2.0 Module 01 — customer-only placeholder (not one of
          ProjectSubNav's project tabs; reached only from the customer
          Sidebar's new Photos item). */}
      {screen === 'project-customer' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectCustomerScreen
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-timeline' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectTimelineScreen
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {screen === 'project-photos' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectPhotosScreen
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            onNavigate={navigateTo}
          />
        </div>
      )}
      {/* Houzeify 2.0 Module 02 — Home Services hidden-navigation
          placeholder. The one unavoidable entry point left (Sidebar's
          demoted "Services" item) lands here instead of the real booking
          flow — see homeownerDashboard.ts's DASHBOARD_ROUTES.homeServices. */}
      {screen === 'home-services-coming-soon' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ComingSoonScreen placeholderId="home-services-coming-soon" shell="customer" activeCustomerId="services" onNavigate={navigateTo} />
        </div>
      )}
      {/* Customer Implementation 09G — AIAdvisorScreen gets the real
          onboarding name only (projectData.full_name), same as Home (09B);
          no hardcoded homeownerProfile fallback. */}
      {screen === 'ai-advisor' && (
        <div style={{ ...slide }}>
          <AIAdvisorScreen
            onNavigate={navigateTo}
            role={resolvedRole}
            primaryIntent={projectData.primary_intent}
            preferredName={projectData.preferred_name}
            fullName={projectData.full_name}
            city={projectData.city}
            state={projectData.state}
            projectName={projectData.project_name}
            projectLocation={projectData.location}
            projectStage={projectData.project_stage}
            initialQuery={projectData.ai_query}
          />
        </div>
      )}
      {screen === 'home-services' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <HomeServicesScreen
            onNavigate={navigateTo}
            city={projectData.city}
            state={projectData.state}
            serviceEntry={projectData.service_entry}
            serviceGroup={projectData.service_group}
            openPicker={projectData.open_picker}
            initialQuery={projectData.search_query}
            fullName={projectData.full_name}
            preferredName={projectData.preferred_name}
          />
        </div>
      )}
      {screen === 'hoziehelper-gold' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <HoziehelperGoldScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'hoziehelper-standard' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <HoziehelperStandardScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'salon-luxe' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <SalonLuxeScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'prime' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <PrimeScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'spa-luxe' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <SpaLuxeScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'spa-prime' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <SpaPrimeScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'spa-ayurveda' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <SpaAyurvedaScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'hair-studio-for-women' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <HairStudioForWomenScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'makeup-saree-styling' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <MakeupSareeStylingScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'salon-royale' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <SalonRoyaleScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'salon-prime' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <SalonPrimeScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'massage-royale' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <MassageRoyaleScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'massage-prime' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <MassagePrimeScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'massage-ayurveda' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <MassageAyurvedaScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'bathroom-cleaning' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <BathroomCleaningScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'kitchen-cleaning' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <KitchenCleaningScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'living-bedroom-cleaning' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <LivingBedroomCleaningScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'full-home-cleaning' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <FullHomeCleaningScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'cockroach-control' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CockroachControlScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'termite-control' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <TermiteControlScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'ants-bedbugs-control' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <AntsBedBugsControlScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'wall-panels-installation' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <WallPanelsScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'painting-few-walls-rooms' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <PaintingFewWallsRoomsScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'electrician' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ElectricianScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'plumbing' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <PlumbingScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'carpentry' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CarpentryScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'civil-work' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CivilWorkScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'furniture-assembly' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <FurnitureAssemblyScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'geyser-service-repair' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <GeyserServiceRepairScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'tile-grouting' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <TileGroutingScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'lights-installation' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <LightsInstallationScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'booking-details' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <BookingDetailsScreen
            onNavigate={navigateTo}
            origin={projectData.hoziehelper_checkout_origin}
          />
        </div>
      )}
      {screen === 'address' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <AddressScreen
            onNavigate={navigateTo}
            origin={projectData.hoziehelper_checkout_origin}
            city={projectData.city}
            state={projectData.state}
          />
        </div>
      )}
      {screen === 'saved-addresses' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <SavedAddressesScreen
            onNavigate={navigateTo}
            city={projectData.city}
            state={projectData.state}
          />
        </div>
      )}
      {screen === 'date-time' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <DateTimeScreen
            onNavigate={navigateTo}
            origin={projectData.hoziehelper_checkout_origin}
          />
        </div>
      )}
      {screen === 'checkout' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CheckoutScreen
            onNavigate={navigateTo}
            origin={projectData.hoziehelper_checkout_origin}
            phone={phone}
            city={projectData.city}
            state={projectData.state}
          />
        </div>
      )}
      {screen === 'booking-confirmation' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <BookingConfirmationScreen
            onNavigate={navigateTo}
            taxesAndFee={projectData.taxes_and_fee}
            tip={projectData.tip}
            amountToPay={projectData.amount_to_pay}
          />
        </div>
      )}
      {screen === 'my-bookings' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <MyBookingsScreen onNavigate={navigateTo} />
        </div>
      )}
      {screen === 'booking-detail' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <BookingDetailScreen onNavigate={navigateTo} bookingId={projectData.booking_id} />
        </div>
      )}
      {screen === 'service-category-detail' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ServiceCategoryDetailScreen
            onNavigate={navigateTo}
            serviceCategoryId={projectData.service_category_id}
            city={projectData.city}
            state={projectData.state}
            primaryIntent={projectData.primary_intent}
            serviceEntry={projectData.service_entry}
            locationId={projectData.location_id}
            fullName={projectData.full_name}
            preferredName={projectData.preferred_name}
          />
        </div>
      )}
      {screen === 'create-project' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CreateProjectScreen
            onNavigate={navigateTo}
            initialPropertyType={resolvedPropertyType}
            initialLocation={resolvedLocation}
            initialProjectId={projectData.project_id}
            homeType={projectData.home_type}
            constructionStage={projectData.construction_stage}
            homeBHK={projectData.home_bhk}
            homeBuiltUpArea={projectData.home_built_up_area}
            homeFloorCount={projectData.home_floor_count}
          />
        </div>
      )}
      {screen === 'house-requirements' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <HouseRequirementsScreen
            onNavigate={navigateTo}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            location={resolvedLocation}
            homeType={projectData.home_type}
            homeBHK={projectData.home_bhk}
            homeBuiltUpArea={projectData.home_built_up_area}
            homeFloorCount={projectData.home_floor_count}
            hasHousePlan={projectData.has_house_plan}
          />
        </div>
      )}
      {screen === 'review-requirements' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ReviewRequirementsScreen
            onNavigate={navigateTo}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            propertyType={resolvedPropertyType}
            location={resolvedLocation}
            hasHousePlan={projectData.has_house_plan}
          />
        </div>
      )}
      {screen === 'estimate-loading' && (
        <div style={{ ...slide }}>
          <EstimateLoadingScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            area={resolvedBuiltUpArea}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'estimate-dashboard' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <EstimateDashboardScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            area={resolvedBuiltUpArea}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'cost-breakdown' && (
        <div style={{ ...slide }}>
          <CostBreakdownScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            area={resolvedBuiltUpArea}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'material-estimate' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <MaterialEstimateScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            area={resolvedBuiltUpArea}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'labour-estimate' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <LabourEstimateScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            area={resolvedBuiltUpArea}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'construction-stages' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ConstructionStagesScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            area={resolvedBuiltUpArea}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'cost-assumptions' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CostAssumptionsScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            area={resolvedBuiltUpArea}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'estimate-comparison' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <EstimateComparisonScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            area={resolvedBuiltUpArea}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'estimate-revision' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <EstimateRevisionScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            area={resolvedBuiltUpArea}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'final-estimate' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <FinalEstimateScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            area={resolvedBuiltUpArea}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'boq-overview' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <BOQOverviewScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            area={resolvedBuiltUpArea}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'detailed-boq' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <DetailedBOQScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            area={resolvedBuiltUpArea}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'boq-item-detail' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <BOQItemDetailScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            itemId={projectData.boq_item_id}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'boq-edit' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <BOQEditScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            itemId={projectData.boq_item_id}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'boq-version-history' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <BOQVersionHistoryScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            area={resolvedBuiltUpArea}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'material-calculator' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <MaterialCalculatorScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'material-detail' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <MaterialDetailScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            materialId={projectData.material_id}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'material-price-check' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <MaterialPriceCheckScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            materialId={projectData.material_id}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'upload-plan' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <UploadPlanScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            projectId={projectData.project_id}
            flow={projectData.flow}
          />
        </div>
      )}
      {screen === 'plan-analysis-loading' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <PlanAnalysisLoadingScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            documentId={projectData.document_id}
            documentName={projectData.document_name}
            documentMimeType={projectData.document_mime_type}
            documentPageCount={projectData.document_page_count}
            documentSize={projectData.document_size}
            documentPreviewUrl={projectData.document_preview_url}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'plan-analysis-result' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <PlanAnalysisResultScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            documentId={projectData.document_id}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'plan-measurement' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <PlanMeasurementScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            documentId={projectData.document_id}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'plan-vs-estimate' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <PlanVsEstimateScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            documentId={projectData.document_id}
            projectId={projectData.project_id}
          />
        </div>
      )}
      {screen === 'estimate-update' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <EstimateUpdateScreen
            onNavigate={navigateTo}
            projectName={projectData.project_name ?? '3 BHK G+1 House'}
            location={resolvedLocation ?? 'Hyderabad'}
            documentId={projectData.document_id}
            projectId={projectData.project_id}
          />
        </div>
      )}

      {DEV_SCREEN_TOOLS && (
        <DevScreenSwitcher
          current={screen}
          onJump={(s) => {
            // Project SubNav only mounts when project_id is set. Seed a demo
            // project when jumping straight to project screens from the switcher
            // so those rails are previewable without going through create/list.
            const seed = getDevDeepLinkSeed(s)
            if (Object.keys(seed).length > 0) {
              navigateTo(s, seed)
            } else {
              setScreen(s)
            }
          }}
        />
      )}
    </div>
    </SubscriptionProvider>
    </CustomerAddressProvider>
    </CustomerCartProvider>
  )
}
