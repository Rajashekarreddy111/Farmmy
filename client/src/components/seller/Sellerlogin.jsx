import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

function Sellerlogin() {
  const { isseller, setisseller, navigate, axios } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      if (!otpSent) {
        const { data } = await axios.post("/api/seller/login", {
          email,
          password,
        });
        if (data.success) {
          setOtpSent(true);
          toast.success("OTP sent");
        } else {
          toast.error(data.message);
        }
        return;
      }
      const { data } = await axios.post("/api/seller/verify-otp", {
        email,
        otp,
      });
      if (data.success) {
        setisseller(true);
        navigate("/seller");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isseller) {
      navigate("/seller");
    }
  }, [isseller]);

  return (
    !isseller && (
      <div>
        <form
          onSubmit={onSubmitHandler}
          className="min-h-screen flex items-center text-sm text-gray-600"
        >
          <div className="flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200">
            <p className="text-2xl font-medium m-auto">
              <span className="text-primary">Seller</span> Login
            </p>
            <p className="text-sm text-gray-500 m-auto">Use your seller credentials to login</p>
            <div className="w-full">
              <p>Email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="enter Email"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                required
              />
            </div>
            <div className="w-full">
              <p>Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="enter password"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                required
              />
            </div>
            {otpSent && (
              <div className="w-full">
                <p>OTP</p>
                <input
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                  type="text"
                  placeholder="enter OTP"
                  className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                  required
                />
              </div>
            )}
            <button className="bg-primary hover:bg-primary-dull transition-all text-white w-full py-2 rounded-md cursor-pointer">
              {otpSent ? "Verify OTP" : "Send OTP"}
            </button>
            <p className="text-sm text-gray-500 m-auto">
              <span
                className="text-primary cursor-pointer"
                onClick={async () => {
                  try {
                    const { data } = await axios.post("/api/seller/send-reset-otp", { email });
                    if (data.success) {
                      toast.success("Reset OTP sent");
                      navigate("/resetpassword", { state: { email, role: "seller" } });
                    } else {
                      toast.error(data.message);
                    }
                  } catch (e) {
                    toast.error(e.message);
                  }
                }}
              >
                Forgot password?
              </span>
            </p>
          </div>
        </form>
      </div>
    )
  );
}

export default Sellerlogin;
