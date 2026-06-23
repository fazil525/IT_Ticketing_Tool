import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("auratick_session");

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const user = JSON.parse(session.value);

    const { data: dbUser, error } = await supabaseAdmin
      .from("users")
      .select("id,email,full_name,role,department_id,is_active")
      .eq("id", user.id)
      .single();

    if (error || !dbUser) {
      const response = NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
      response.cookies.delete("auratick_session");
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      user: dbUser,
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}