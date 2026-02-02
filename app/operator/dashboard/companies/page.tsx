import { getManagementCompanies } from './actions'
import CompaniesClient from './CompaniesClient'

export default async function CompaniesPage() {
  const companies = await getManagementCompanies()
  return <CompaniesClient initialCompanies={companies} />
}
