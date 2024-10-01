import { Button, Form, Input, Typography } from "antd";
import { useFormik } from "formik";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  GoogleOutlined,
} from "@ant-design/icons";
import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { LoginSchema, loginSchema } from "../../validators/auth.validator";

export const Route = createFileRoute("/_AuthLayout/login")({
  component: LoginPage,
});

function LoginPage() {
  const formik = useFormik<LoginSchema>({
    initialValues: { email: "", password: "" },
    onSubmit: (values) => {},
    validationSchema: loginSchema,
  });

  return (
    <>
      <div className="w-80">
        <Typography.Title className="text-white text-center">
          Vibe Space
        </Typography.Title>
        <Form onFinish={formik.handleSubmit}>
          <Form.Item
            validateStatus={
              formik.touched.email && formik.errors.email ? "error" : ""
            }
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
              formik.touched.password && formik.errors.password ? "error" : ""
            }
            help={formik.touched.password && formik.errors.password}
          >
            <Input.Password
              addonBefore="Password"
              placeholder="Type your password"
              className="bg-white rounded-lg"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              value={formik.values.password}
              onChange={formik.handleChange}
              name="password"
            />
          </Form.Item>
          <div className="flex justify-center gap-2">
            <Button type="primary" htmlType="submit">
              Login
            </Button>
            <Button type="primary">Sign up</Button>
            <Button type="primary" href="http://localhost:3000/google">
              Login with google <GoogleOutlined />
            </Button>
          </div>
        </Form>
        <Outlet />
      </div>
    </>
  );
}
