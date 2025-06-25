import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const signupSchema = z.object({
  username: z.string().min(3, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function SignupForm() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

 const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:5000/signup", data);

      //Store token and user info correctly
      localStorage.setItem(
        "user",
        JSON.stringify({
          token: response.data.access_token,
          ...response.data.user,
        })
      );

      navigate("/main");
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed");
    }
  };


  return (
    <div className="min-h-screen bg-sky-400 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-2xl p-6 sm:p-8 lg:p-10 rounded-3xl w-full max-w-sm sm:max-w-md lg:max-w-lg"
      >
        <h1 className="text-3xl sm:text-4xl font-[cursive] text-center text-black mb-3">
          Link App
        </h1>

        <h2 className="text-xl sm:text-2xl font-semibold text-center text-gray-800 mb-6">
          Sign up
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              {...register("username")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 w-full rounded-md transition cursor-pointer"
        >
          {isSubmitting ? "Signing up..." : "Sign up"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-800">
          Already a member?{" "}
          <Link
            to="/login"
            className="text-blue-800 hover:underline font-semibold"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignupForm;
