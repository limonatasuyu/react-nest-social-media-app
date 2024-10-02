import { Button, Form, Input, Typography, DatePicker } from "antd";
import { useFormik } from "formik";
import { EyeInvisibleOutlined, EyeTwoTone, GoogleOutlined } from "@ant-design/icons";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { registerSchema, RegisterSchema } from "../../validators/auth.validator";
import background from "/background2.jpg";

export const Route = createFileRoute("/_AuthLayout/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const formik = useFormik<RegisterSchema>({
    initialValues: {
      firstname: "",
      lastname: "",
      email: "",
      emailConfirmation: "",
      password: "",
      passwordConfirmation: "",
      username: "",
      dateOfBirth: null as unknown as Date//new Date(),
    },
    onSubmit: (values) => {
      console.log(values);
    },
    validationSchema: registerSchema,
  });

  return (
    <div
      className="w-screen h-screen flex justify-center items-center"
      style={{
        background: `url(${background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-80">
        <Typography.Title className="text-white text-center">Vibe Space</Typography.Title>
        <Form onFinish={formik.handleSubmit}>
          <Form.Item
            validateStatus={formik.touched.firstname && formik.errors.firstname ? "error" : ""}
            help={formik.touched.firstname && formik.errors.firstname}
          >
            <Input
              addonBefore="First Name"
              className="bg-white rounded-lg"
              value={formik.values.firstname}
              onChange={formik.handleChange}
              name="firstname"
            />
          </Form.Item>
          <Form.Item
            validateStatus={formik.touched.lastname && formik.errors.lastname ? "error" : ""}
            help={formik.touched.lastname && formik.errors.lastname}
          >
            <Input
              addonBefore="Last Name"
              className="bg-white rounded-lg"
              value={formik.values.lastname}
              onChange={formik.handleChange}
              name="lastname"
            />
          </Form.Item>
          <Form.Item
            validateStatus={formik.touched.username && formik.errors.username ? "error" : ""}
            help={formik.touched.username && formik.errors.username}
          >
            <Input
              addonBefore="Username"
              className="bg-white rounded-lg"
              value={formik.values.username}
              onChange={formik.handleChange}
              name="username"
            />
          </Form.Item>
          <Form.Item
            validateStatus={formik.touched.email && formik.errors.email ? "error" : ""}
            help={formik.touched.email && formik.errors.email}
          >
            <Input
              addonBefore="Email"
              className="bg-white rounded-lg"
              value={formik.values.email}
              onChange={formik.handleChange}
              name="email"
            />
          </Form.Item>
          <Form.Item
            validateStatus={
              formik.touched.emailConfirmation && formik.errors.emailConfirmation ? "error" : ""
            }
            help={formik.touched.emailConfirmation && formik.errors.emailConfirmation}
          >
            <Input
              addonBefore="Confirm Email"
              className="bg-white rounded-lg"
              value={formik.values.emailConfirmation}
              onChange={formik.handleChange}
              name="emailConfirmation"
            />
          </Form.Item>
          <Form.Item
            validateStatus={formik.touched.password && formik.errors.password ? "error" : ""}
            help={formik.touched.password && formik.errors.password}
          >
            <Input.Password
              addonBefore="Password"
              placeholder="Type your password"
              className="bg-white rounded-lg"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              value={formik.values.password}
              onChange={formik.handleChange}
              name="password"
            />
          </Form.Item>
          <Form.Item
            validateStatus={
              formik.touched.passwordConfirmation && formik.errors.passwordConfirmation ? "error" : ""
            }
            help={formik.touched.passwordConfirmation && formik.errors.passwordConfirmation}
          >
            <Input.Password
              addonBefore="Confirm Password"
              placeholder="Confirm your password"
              className="bg-white rounded-lg"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              value={formik.values.passwordConfirmation}
              onChange={formik.handleChange}
              name="passwordConfirmation"
            />
          </Form.Item>
          <Form.Item
            validateStatus={formik.touched.dateOfBirth && formik.errors.dateOfBirth ? "error" : ""}
            help={
              formik.touched.dateOfBirth && formik.errors.dateOfBirth ? String(formik.errors.dateOfBirth) : ""
            }
          >
            <DatePicker
              className="bg-white w-full rounded-lg"
              onChange={(date) => formik.setFieldValue("dateOfBirth", date)}
              value={formik.values.dateOfBirth}
              name="dateOfBirth"
              placeholder="Select your date of birth"
            />
          </Form.Item>

          <div className="flex justify-center gap-2">
            <Button type="primary" htmlType="submit">
              Register
            </Button>
            <Button type="primary" href="/login">
              Already have an account? Log in
            </Button>
            <Button type="primary" href="http://localhost:3000/auth/google">
              Register with Google <GoogleOutlined />
            </Button>
          </div>
        </Form>
        <Outlet />
      </div>
    </div>
  );
}
