import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return new NextResponse("URL parameter is required", { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        Accept: "*/*",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch content: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get("Content-Type") || "application/octet-stream";
    const fileContent = await response.blob();

    const res = new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, max-age=3600",
      },
    });

    return res;
  } catch (error) {
    console.error("Error in proxy endpoint:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
