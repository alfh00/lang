import { userApi} from "../src/lib/userClient"

async function runTests() {
  console.log("🧪 Running API tests...\n")

  try {
    // 1. Register
    const reg = await userApi.register({email:"student2@example.com", password:"12345678", username: "John Student"})
    console.log("✅ Register:", reg)

    // 2. Login
    const login = await userApi.signIn("student2@example.com", "12345678")
    console.log("✅ Login token:", login.token.slice(0, 10) + "...")
    localStorage.setItem("auth_token", login.token)

    // 3. Current user
    const me = await userApi.getUser()
    console.log("✅ Current user:", me.full_name, "role:", me.role)

    // 4. Teachers
    const teachers = await teachersApi.list()
    console.log("✅ Found teachers:", teachers.length)

    // 5. Bookings
    const bookings = await bookingsApi.list()
    console.log("✅ Bookings fetched:", bookings.length)
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

runTests()
