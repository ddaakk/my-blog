import React from 'react';
import ReactGA from 'react-ga';
import { useStaticQuery, graphql } from 'gatsby';
import { createBrowserHistory } from 'history';
import PageHeader from '../components/page-header';
import PageFooter from '../components/page-footer';
import ThemeSwitch from '../components/theme-switch';
import './style.scss';

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          author {
            name
            social {
              github
            }
          }
        }
      }
    }
  `);
  const { title, author, ga } = data.site.siteMetadata;

  ReactGA.initialize(ga);
  const history = createBrowserHistory();
  history.listen((response) => {
    ReactGA.set({ page: response.location.pathname });
    ReactGA.pageview(response.location.pathname);
  });

  return (
    <div className="page-wrapper">
      <PageHeader siteTitle={title || `Title`} />
      <main className="page-content">{children}</main>
      <PageFooter
        author={author.name || `Author`}
        githubUrl={author.social?.github || `https://www.github.com`}
      />
      <ThemeSwitch />
    </div>
  );
};

export default Layout;
