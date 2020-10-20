import React, { ReactNode, useEffect } from 'react';
// import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from './Link';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const useTabButtonStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(1),
    textTransform: 'none'
  },
  current: {
    color: theme.palette.primary.main
  }
}));

type TabButtonProps = {
  label: string;
  href: string;
  naked?: boolean;
  curTab?: boolean;
};
function TabButton({
  label,
  href,
  naked = true,
  curTab = false
}: TabButtonProps) {
  const classes = useTabButtonStyles();
  return (
    <Button className={classes.root} component={Link} naked={naked} href={href}>
      <Typography className={curTab ? classes.current : ''} variant="h6">
        {label}
      </Typography>
    </Button>
  );
}

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = 'This is the default title' }: Props) => {
  const router = useRouter();

  useEffect(() => {}, [router]);
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <AppBar color="default" position="static" elevation={0}>
        <Toolbar>
          {[
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
            { label: 'User List', href: '/users' },
            {
              label: 'Users API',
              href: 'https://www.google.co.jp'
            }
          ].map((v, i) => (
            <TabButton {...v} curTab={router.pathname === v.href} key={i} />
          ))}
        </Toolbar>
      </AppBar>
      {children}
      <footer>
        <hr />
        <span>I'm here to stay (Footer)</span>
      </footer>
    </div>
  );
};

export default Layout;
