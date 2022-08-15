import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

import { fauna } from '../../../services/fauna'
import { query as q } from 'faunadb'

export default NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            scope: 'read:user'
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log(user)
            const { email } = user
            console.log(email)

            try {
                await fauna.query(
                    q.If(
                        q.Not(
                            q.Exists(
                                q.Match(
                                    q.Index('user_by_email'),
                                    q.Casefold(user.email)
                                )
                            )
                        ),
                        q.Create(
                            q.Collection('users'),
                            { data: { email } }
                        ),
                        q.Get(
                            q.Match(
                                q.Index('user_by_email'),
                                q.Casefold(user.email)
                            )
                        )
                    )
                )

                return true
            } catch {
                return false
            }
        },
        // async redirect({ url, baseUrl }) {
        //     return baseUrl
        // },
        // async session({ session, user, token }) {
        //     return session
        // },
        // async jwt({ token, user, account, profile, isNewUser }) {
        //     return token
        // }
    }
})