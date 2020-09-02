import React from 'react';
import { graphql } from 'gatsby';
import { Router, Link, Location } from '@reach/router';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import {
    mapEdgesToNodes,
    filterOutDocsWithoutSlugs,
    filterOutDocsPublishedInTheFuture,
} from '../lib/helpers';
import BlogPostPreviewList from '../components/blog-post/blog-post-preview-list';
import Container from '../components/container';
import GraphQLErrorList from '../components/graphql-error-list';
import SEO from '../components/seo';
import Layout from '../containers/layout';

export const query = graphql`
  fragment SanityImage on SanityMainImage {
    crop {
      _key
      _type
      top
      bottom
      left
      right
    }
    hotspot {
      _key
      _type
      x
      y
      height
      width
    }
    asset {
      _id
    }
  }

  query IndexPageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      description
      keywords
    }
    posts: allSanityPost(
      limit: 6
      sort: { fields: [publishedAt], order: DESC }
      filter: { slug: { current: { ne: null } }, publishedAt: { ne: null } }
    ) {
      edges {
        node {
          id
          publishedAt
          mainImage {
            ...SanityImage
            alt
          }
          title
          _rawExcerpt
          slug {
            current
          }
        }
      }
    }
  }
`;

const FadeTransitionRouter = (props) => (
    <Location>
        {({ location }) => (
            <TransitionGroup className="transition-group">
                <CSSTransition key={location.key} classNames="fade" timeout={500}>
                    <Router location={location} className="router">
                        {props.children}
                    </Router>
                </CSSTransition>
            </TransitionGroup>
        )}
    </Location>
);



const Page = (props) => (
    <div
        className="page"
        style={{ background: `hsl(${props.page * 75}, 60%, 60%)` }}
    >
        {props.page}
    </div>
);

const IndexPage = (props) => {
    const { data, errors } = props;

    if (errors) {
        return (
            <Layout>
                <GraphQLErrorList errors={errors} />
            </Layout>
        );
    }

    const { site } = data || {};
    const postNodes = (data || {}).posts
        ? mapEdgesToNodes(data.posts)
            .filter(filterOutDocsWithoutSlugs)
            .filter(filterOutDocsPublishedInTheFuture)
        : [];
    console.info(postNodes);
    if (!site) {
        throw new Error(
            'Missing "Site settings". Open the studio at http://localhost:3333 and add some content to "Site settings" and restart the development server.',
        );
    }

    return (
        <Layout>
            <SEO
                title={site.title}
                description={site.description}
                keywords={site.keywords}
            />
            <Container>
                <Link to="/page/2">2</Link>
                <FadeTransitionRouter>
                    <BlogPostPreviewList
                        title="Latest blog posts"
                        nodes={postNodes}
                        browseMoreHref="/archive/"
                        path="/:country"
                    />
                    <Page path="/:country/page/:page" />
                </FadeTransitionRouter>
                <h1 hidden>Welcome to {site.title}</h1>
            </Container>
        </Layout>
    );
};

export default IndexPage;
