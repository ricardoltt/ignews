import { GetStaticProps } from 'next'
import Head from 'next/head'
import { getPrismicClient } from '../../services/prismic'
import styles from './styles.module.scss'
import Prismic from '@prismicio/client'

export default function Posts() {
    return (
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    <a href="https://github.com/">
                        <time>12 de março de 2021</time>
                        <strong>Creating a asd</strong>
                        <p>asdasdasdasdas asdasdasdasdasasdasdasdasdas asdasdasdasdas</p>
                    </a>
                </div>
            </main>
        </>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicClient()

    const response = await prismic.getAllByType('post')

    console.log(response)

    return {
        props: {}
    }
}