const SUPABASE_URL = "https://znvonvyyahmiewzqgkei.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpudm9udnl5YWhtaWV3enFna2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDkxMjIsImV4cCI6MjA5MTcyNTEyMn0.1rwUpQhkboNhoojEYGWO9gUYltR_QaAW4Bgbxyn0788";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);



// SIGNUP
async function signup() {

  const name = document.getElementById("name").value;
  const lastname = document.getElementById("lastname").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmpassword").value;

  // Supabase Auth Signup
  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    alert(error.message);
    return;
  }

  // Save user details in table
  const { error: insertError } = await supabaseClient
    .from("users")
    .insert([
      {
        name: name,
        last: lastname,
        email: email,
        phone: phone,
        password: password,
        confirmpassword: confirm,
      }
    ]);

  if (insertError) {
    alert(insertError.message);
    return;
  }

  alert("Signup Successful");
}



// SIGNIN
async function signin() {

  const email = document.getElementById("signinEmail").value;
  const password = document.getElementById("signinPassword").value;


  if(password !== confirm){
  alert("Passwords do not match");
  return;
}

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Signin Successful");

  console.log(data.user);
}