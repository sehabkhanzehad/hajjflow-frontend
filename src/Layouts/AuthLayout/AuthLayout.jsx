const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center justify-center gap-40">
        <div className="hidden lg:block">
          <img src="/images/sign-up.svg" alt="Login image" className="h-auto w-[600px]" />
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
