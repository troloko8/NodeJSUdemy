import axios from "axios"
import { showAlert } from "./alerts.js";

export const bookTour = async tourId => {
    const stripe = Stripe('pk_test_51PVIZCKhxG4HBFylN3uBjwRsMYD8Igen9oFqYd4iAs6rGheIzUNT7Dkx1gPgI41ZYoLMftODGYkOeqlr42GBfJIP004uWIvTmi')

    try {

        // 1. Get checkout session from the API
        const session = await axios(
            `/api/v1/booking/checkout-session/${tourId}`
        )

        // 2. Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })

    } catch (err) {
        console.log(err)
        showAlert('error', err)
    }
}