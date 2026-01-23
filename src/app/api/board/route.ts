import { NextResponse } from "next/server";

// API Response Types
interface APISprint {
  id: string;
  name: string;
  start: string;
  finish: string;
  goal?: string;
  ordinal?: number;
  archived?: boolean;
  isDefault?: boolean;
  isStarted?: boolean;
}

interface APIColumn {
  id: string;
  fieldValues: Array<{ name: string }>;
}

interface APISwimlaneValue {
  id: string;
  presentation: string;
}

interface APIResponse {
  sprints?: APISprint[];
  columnSettings?: {
    columns?: APIColumn[];
  };
  swimlaneSettings?: {
    values?: APISwimlaneValue[];
  };
  currentSprint: { id: string };
  id: string;
  name: string;
}

interface Sprint {
  id: string;
  name: string;
  start: string;
  finish: string;
  goal?: string;
  ordinal?: number;
  archived?: boolean;
  isDefault?: boolean;
  isStarted?: boolean;
}

interface State {
  id: string;
  name: string;
  color?: {
    background?: string;
    foreground?: string;
  };
}

interface SubTribe {
  id: string;
  name: string;
  color?: string;
}

interface BoardData {
  id: string;
  name: string;
  currentSprint: { id: string };
  sprints: Sprint[];
  states: State[];
  subtribes: SubTribe[];
}

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

    const agileId = "103-133";
    const apiUrl =
      "https://brightan.myjetbrains.com/youtrack/api/agiles/" +
      agileId +
      "?$top=-1&fields=columnSettings(columns(collapsed,color($type,id),fieldValues(canUpdate,column(id),id,isResolved,name,ordinal,presentation),id,isResolved,isVisible,ordinal,parent($type,id),wipLimit($type,max,min)),field(fieldDefaults(bundle(id,isUpdateable)),fieldType(id,presentation,valueType),id,instances(project(id)),localizedName,name,type),id,showBundleWarning),currentSprint(id),id,name,sprints(archived,finish,id,isDefault,isStarted,name,start),swimlaneSettings($type,defaultCardType(id,name),enabled,field(customField(fieldDefaults(bundle(id,isUpdateable)),fieldType(id,presentation,valueType),id,instances(project(id)),localizedName,name,type),id,instant,multiValue,name,presentation),id,values(id,isResolved,name,presentation,value))";

    console.warn("Fetching board configuration from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + authToken,
        "User-Agent": "YouTrack-Issues-Viewer",
      },
    });

    if (!response.ok) {
      throw new Error("HTTP error! status: " + response.status);
    }

    const data = await response.json() as APIResponse;
    console.warn(data);

    // Extract and transform the data
    const boardData: BoardData = {
      sprints: (data.sprints || []).map((sprint: APISprint) => ({
        id: sprint.id,
        name: sprint.name,
        start: sprint.start,
        finish: sprint.finish,
        goal: sprint.goal,
        ordinal: sprint.ordinal,
        archived: sprint.archived,
        isDefault: sprint.isDefault,
        isStarted: sprint.isStarted,
      })).reverse(),
      states: (data.columnSettings?.columns || []).map((column: APIColumn) => ({
        id: column.id,
        name: column.fieldValues[0].name,
      })),
      subtribes: (data.swimlaneSettings?.values || []).map((setting: APISwimlaneValue) => ({
        id: setting.id,
        name: setting.presentation,
      })),
      currentSprint: data.currentSprint,
      id: data.id,
      name: data.name,
    };

    console.warn("Successfully fetched and transformed board configuration");

    return NextResponse.json(boardData);
  } catch (error) {
    console.error("Error fetching board configuration:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch board configuration",
      },
      { status: 500 },
    );
  }
}
