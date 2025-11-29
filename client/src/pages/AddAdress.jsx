import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";

const Inputfield = ({ type, placeholder, name, handlechange, address }) => (
  <input
    type={type}
    placeholder={placeholder}
    onChange={handlechange}
    name={name}
    value={address[name]}
    required
    className="w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition"
  />
);

const AddAdress = () => {
  const [address, setAddress] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        adress: {
          firstName: address.firstname,
          lastName: address.lastname,
          email: address.email,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: Number(address.zipcode),
          country: address.country,
        },
      };
      const { data } = await axios.post("/api/adress/add", payload, {
        withCredentials: true,
      });
      if (data.sucess) {
        toast.success("Address saved");
      } else {
        toast.error(data.message || "Failed to save address");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };
  return (
    <div className="mt-16 pb-16">
      <p className="text-2xl md:text-3xl text-gray-500">
        Add Shipping <span className="font-semibold text-primary">Adress</span>
      </p>
      <div className="flex flex-col-reverse md:flex-row justify-between mt-10">
        <div className="flex-1 max-w-md">
          <form onSubmit={onSubmitHandler} className="space-y-3 mt-6 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <Inputfield
                handlechange={handleChange}
                address={address}
                name="firstname"
                type="text"
                placeholder="First Name"
              />
              <Inputfield
                handlechange={handleChange}
                address={address}
                name="lastname"
                type="text"
                placeholder="Last Name"
              />
            </div>

            <Inputfield
              handlechange={handleChange}
              address={address}
              name="email"
              type="email"
              placeholder="Email Adress"
            />

            <Inputfield
              handlechange={handleChange}
              address={address}
              name="street"
              type="text"
              placeholder="Street"
            />

            <div className="grid grid-cols-2 gap-4">
              <Inputfield
                handlechange={handleChange}
                address={address}
                name="city"
                type="text"
                placeholder="City"
              />
              <Inputfield
                handlechange={handleChange}
                address={address}
                name="state"
                type="text"
                placeholder="State"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Inputfield
                handlechange={handleChange}
                address={address}
                name="zipcode"
                type="number"
                placeholder="Zip Code"
              />
              <Inputfield
                handlechange={handleChange}
                address={address}
                name="country"
                type="text"
                placeholder="Country"
              />
            </div>

            <Inputfield
              handlechange={handleChange}
              address={address}
              name="phone"
              type="text"
              placeholder="Phone"
            />

            <button className="w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer uppercase">
              Save Adress
            </button>
          </form>
        </div>
        <img
          className="md:mr-16 mb-16 md:mt-0"
          src={assets.add_address_iamge}
          alt="Add adress"
        />
      </div>
    </div>
  );
};

export default AddAdress;
