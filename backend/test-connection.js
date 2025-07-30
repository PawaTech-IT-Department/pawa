// We need to import the 'default' export, so we can name it anything.
// Let's call it 'supabase' to be clear.
import supabase from "./supabase/client.js";

// Create an async function to run our test
const testConnection = async () => {
  console.log("Attempting to connect to Supabase...");

  try {
    // This is the simplest query: fetch all rows from the 'profiles' table.
    // We limit it to 5 rows just to be efficient.
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .limit(5);

    // Check if there was an error during the query
    if (error) {
      // If there's an error, the connection or query failed.
      console.error("❌ Connection to Supabase failed:", error.message);
      return;
    }

    // If we get here, the connection was successful!
    console.log("✅ Connection to Supabase successful!");
    console.log("Data fetched from 'profiles' table:", data);

    if (data.length === 0) {
      console.log(
        "Note: The 'profiles' table is currently empty, but the connection works perfectly."
      );
    }
  } catch (err) {
    console.error("An unexpected error occurred:", err);
  }
};

// Run the test function
testConnection();
