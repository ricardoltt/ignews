import { render, screen, fireEvent } from "@testing-library/react";
import { signIn } from "next-auth/react";
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { SubscribeButton } from './'


jest.mock('next-auth/react')

jest.mock('next/router', () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
    }),
}))

describe('SubscribeButton component', () => {
    it('renders correctly', () => {
        const useSessionMocked = jest.mocked(useSession)

        useSessionMocked.mockReturnValueOnce({
            data: null,
            status: "unauthenticated"
        })

        render(<SubscribeButton />)

        expect(screen.getByText('Subscribe now')).toBeInTheDocument()
    })

    it('redirects user to sign in when not authenticated', () => {
        const signInMocked = jest.mocked(signIn)
        const useSessionMocked = jest.mocked(useSession)

        useSessionMocked.mockReturnValueOnce({
            data: null,
            status: "unauthenticated"
        })

        render(<SubscribeButton />)

        const subscribeButton = screen.getByText('Subscribe now')

        fireEvent.click(subscribeButton)

        expect(signInMocked).toBeCalled()
    })

    it('redirects to posts when user already has subscription', () => {
        const useRouterMocked = jest.mocked(useRouter)
        const useSessionMocked = jest.mocked(useSession)
        const pushMock = jest.fn()

        useSessionMocked.mockReturnValueOnce({
            data: {
                user: {
                    name: 'John Doe',
                    email: 'johndoe@example.com'
                },
                activeSubscription: 'fake-active-subscription',
                expires: 'fake-expires'
            },
            status: "authenticated"
        })


        useRouterMocked.mockImplementationOnce(() => ({
            push: pushMock
        } as any));

        render(<SubscribeButton />)

        const subscribeButton = screen.getByText('Subscribe now')

        fireEvent.click(subscribeButton)

        expect(pushMock).toHaveBeenCalledWith('/posts')
    })
})

