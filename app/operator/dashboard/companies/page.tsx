import { getManagementCompanies } from './actions'
import CompaniesClient from './CompaniesClient'
export const dynamic = 'force-dynamic'

export default async function CompaniesPage() {
  const companies = await getManagementCompanies()
  return <CompaniesClient initialCompanies={companies} />
}
