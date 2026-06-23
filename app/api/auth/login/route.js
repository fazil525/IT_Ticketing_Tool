import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { usernameOrEmail, password } = await request.json();

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email: usernameOrEmail,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Fetch user profile from users table
    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

    if (profileError) {
      console.error(profileError);

      return NextResponse.json(
        { error: "User profile not found" },
        { status: 500 }
      );
    }

    const sessionUser = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      department_id: profile.department_id,
      company: profile.company,
      location: profile.location,
    };

    const cookieStore = await cookies();

    cookieStore.set(
      "auratick_session",
      JSON.stringify(sessionUser),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return NextResponse.json({
      success: true,
      user: sessionUser,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}