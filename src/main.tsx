import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './data/authState'
import { CustomerProfileProvider } from './data/customerProfileState'
import { PartnerProfileProvider } from './data/partnerProfileState'
import { OrganizationProvider } from './data/organizationState'
import { ProjectProvider } from './data/projectState'
import { HouseRequirementsProvider } from './data/houseRequirementsState'
import { CustomerProjectsProvider } from './data/customerProjectsState'
import { ThemeProvider } from './shared/theme/ThemeProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        {/* CustomerProfileProvider/PartnerProfileProvider/OrganizationProvider/
            ProjectProvider/HouseRequirementsProvider all read useAuth()
            internally, so all five must be nested inside AuthProvider. They
            are independent siblings, never nested inside each other — the
            approved model lets one authenticated User hold a CustomerProfile,
            a PartnerProfile, membership in one or more Organizations,
            ownership of one or more Projects, and House Requirements for any
            of those projects, all at once, as five genuinely separate
            concepts (see customerProfileState.tsx / partnerProfileState.tsx /
            organizationState.tsx / projectState.tsx /
            houseRequirementsState.tsx). HouseRequirementsProvider is nested
            inside ProjectProvider only for readability — it does not consume
            ProjectProvider's context; it is keyed entirely off the project
            ids callers pass it directly. */}
        <CustomerProfileProvider>
          <PartnerProfileProvider>
            <OrganizationProvider>
              <ProjectProvider>
                <CustomerProjectsProvider>
                  <HouseRequirementsProvider>
                    <App />
                  </HouseRequirementsProvider>
                </CustomerProjectsProvider>
              </ProjectProvider>
            </OrganizationProvider>
          </PartnerProfileProvider>
        </CustomerProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
