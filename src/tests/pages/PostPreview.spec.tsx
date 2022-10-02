import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { getPrismicClient } from '../../services/prismic'


const posts = {
    slug: 'my-new-post',
    title: 'My new Post',
    content: '<p>Post content</p>',
    updatedAt: 'March, 10'
}

jest.mock('next-auth/react')
jest.mock('../../services/prismic')

jest.mock('next/router', () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
    }),
}))

describe('Post preview page', () => {
    it('renders correctly', () => {
        const useSessionMocked = jest.mocked(useSession)

        useSessionMocked.mockReturnValueOnce({
            data: null,
            status: "unauthenticated"
        })

        render(<Post post={posts} />)

        expect(screen.getByText('My new Post')).toBeInTheDocument()
        expect(screen.getByText('Post content')).toBeInTheDocument()
        expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
    })

    it('redirects user to full post when user is subscribed', async () => {
        const useSessionMocked = jest.mocked(useSession)
        const useRouterMocked = jest.mocked(useRouter)
        const pushMock = jest.fn()

        useSessionMocked.mockReturnValueOnce({
            data: {
                activeSubscription: 'fake-active-subscription',
            },
            status: "authenticated"
        } as any)

        useRouterMocked.mockImplementationOnce(() => ({
            push: pushMock
        } as any));

        render(<Post post={posts} />)

        expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post')
    })

    it('loads initial data', async () => {
        const getPrismicClientMocked = jest.mocked(getPrismicClient)

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [
                        { type: 'heading', text: 'My new post' }
                    ],
                    content: [
                        { type: 'paragraph', text: 'Post content' }
                    ],
                },
                last_publication_date: '04-01-2021'
            })
        } as any)

        const response = await getStaticProps({ params: { slug: 'my-new-post' } })

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'my-new-post',
                        title: 'My new post',
                        content: '<p>Post content</p>',
                        updatedAt: '01 de abril de 2021'
                    }
                }
            })
        )
    })
})