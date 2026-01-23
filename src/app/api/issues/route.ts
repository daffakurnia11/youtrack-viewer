import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const authToken = authHeader?.replace("Bearer ", "");

    if (!authToken) {
      return NextResponse.json(
        { error: "Authorization token is required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const fields = searchParams.get('fields')

    console.warn('Query:', query)
    console.warn('Fields:', fields)

    // If query is provided, use it; otherwise use the default query
    const finalQuery = query || '#daffakurniaf11 {Board Employer Kanban}: {W03 Jan 2026 (Q1 Employer)} State: {Completed} State: Verified State: {Deployed to Production} sort by: SubTribe asc sort by: {issue id} asc'
    const finalFields = fields || 'id,idReadable,summary,reporter(id,name,fullName),updater(id,name,fullName),resolved,updated,created,fields(value(id,presentation,name,localizedName,color(id,background,foreground))),project(name,shortName),tags(id,name,color(id,background,foreground))'

    const params = new URLSearchParams({
      query: finalQuery,
      fields: finalFields,
      '$top': '-1'
    })

    const apiUrl = `https://brightan.myjetbrains.com/youtrack/api/issues?${params.toString()}`
    console.warn('Fetching issues from:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'User-Agent': 'YouTrack-Issues-Viewer'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.json()
    console.warn(`Successfully fetched ${Array.isArray(data) ? data.length : 'unknown'} issues`)

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching issues:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}
