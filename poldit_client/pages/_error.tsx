import Custom404 from "_components/pageComponents/Error/error404";
import Custom500 from "_components/pageComponents/Error/error500";
import { ComponentError } from "_components/pageComponents/Error/compError";

const Error = ({ statusCode }: any) => {
  if (statusCode === 404) {
    return <Custom404 />;
  }

  if (statusCode === 500) {
    return <Custom500 />;
  }

  return <ComponentError mssg={"Oops! Something went wrong"} fontSize="lg" />;
};

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
