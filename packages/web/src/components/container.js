import React from 'react';

import styles from './container.module.css';

const Container = ({ children }) => <div className={styles.root}>{children}</div>;

export default Container;
