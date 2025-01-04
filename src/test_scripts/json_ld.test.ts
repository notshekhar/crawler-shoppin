import jsonld from "jsonld"

const exampleJsonLd = {
    "@context": "http://schema.org",
    "@graph": [
        {
            "@context": "https://schema.org/",
            "@type": "Product",
            productID: "470941",
            name: "7 Days to Die (Global) (PC / Mac / Linux) - Steam - Digital Key",
            url: "https://driffle.com/7-days-to-die-steam-cd-key-p470941",
            description:
                "Buy 7 Days to Die (Global) (PC / Mac / Linux) - Steam - Digital Key from Driffle, the place to buy your games at the best price with fast delivery",
            image: "https://static.driffle.com/media-gallery/prod/165995804435731500_7_Days_to_Die.webp",
            sku: "470941",
            brand: {
                "@type": "Brand",
                name: "The Fun Pimps Entertainment LLC",
            },
            releaseDate: "2013-12-13",
            offers: {
                "@type": "AggregateOffer",
                lowPrice: "1387.85",
                highPrice: "1525.66",
                offerCount: 7,
                priceCurrency: "INR",
                offers: [
                    {
                        "@type": "Offer",
                        priceSpecification: [
                            {
                                "@type": "UnitPriceSpecification",
                                price: "1387.85",
                                priceCurrency: "INR",
                            },
                            {
                                "@type": "UnitPriceSpecification",
                                priceType:
                                    "https://schema.org/SubscriptionPrice",
                                price: "1249.06",
                                priceCurrency: "INR",
                            },
                            {
                                "@type": "UnitPriceSpecification",
                                priceType: "https://schema.org/ListPrice",
                                price: "2030.98",
                                priceCurrency: "INR",
                            },
                        ],
                        availability: "http://schema.org/InStock",
                        url: "https://driffle.com/7-days-to-die-steam-cd-key-p470941?seller=296",
                        seller: {
                            "@type": "Organization",
                            name: "NewbeeGame",
                            url: "https://driffle.com/vendor/296",
                        },
                    },
                    {
                        "@type": "Offer",
                        priceSpecification: [
                            {
                                "@type": "UnitPriceSpecification",
                                price: "1417",
                                priceCurrency: "INR",
                            },
                            {
                                "@type": "UnitPriceSpecification",
                                priceType:
                                    "https://schema.org/SubscriptionPrice",
                                price: "1275.3",
                                priceCurrency: "INR",
                            },
                            {
                                "@type": "UnitPriceSpecification",
                                priceType: "https://schema.org/ListPrice",
                                price: "2030.98",
                                priceCurrency: "INR",
                            },
                        ],
                        availability: "http://schema.org/InStock",
                        url: "https://driffle.com/7-days-to-die-steam-cd-key-p470941?seller=161",
                        seller: {
                            "@type": "Organization",
                            name: "ready2play",
                            url: "https://driffle.com/vendor/161",
                        },
                    },
                    {
                        "@type": "Offer",
                        priceSpecification: [
                            {
                                "@type": "UnitPriceSpecification",
                                price: "1435.55",
                                priceCurrency: "INR",
                            },
                            {
                                "@type": "UnitPriceSpecification",
                                priceType:
                                    "https://schema.org/SubscriptionPrice",
                                price: "1292",
                                priceCurrency: "INR",
                            },
                            {
                                "@type": "UnitPriceSpecification",
                                priceType: "https://schema.org/ListPrice",
                                price: "2030.98",
                                priceCurrency: "INR",
                            },
                        ],
                        availability: "http://schema.org/InStock",
                        url: "https://driffle.com/7-days-to-die-steam-cd-key-p470941?seller=309",
                        seller: {
                            "@type": "Organization",
                            name: "Game Zone",
                            url: "https://driffle.com/vendor/309",
                        },
                    },
                    {
                        "@type": "Offer",
                        priceSpecification: [
                            {
                                "@type": "UnitPriceSpecification",
                                price: "1448.81",
                                priceCurrency: "INR",
                            },
                            {
                                "@type": "UnitPriceSpecification",
                                priceType:
                                    "https://schema.org/SubscriptionPrice",
                                price: "1303.92",
                                priceCurrency: "INR",
                            },
                            {
                                "@type": "UnitPriceSpecification",
                                priceType: "https://schema.org/ListPrice",
                                price: "2030.98",
                                priceCurrency: "INR",
                            },
                        ],
                        availability: "http://schema.org/InStock",
                        url: "https://driffle.com/7-days-to-die-steam-cd-key-p470941?seller=163",
                        seller: {
                            "@type": "Organization",
                            name: "Gtougame",
                            url: "https://driffle.com/vendor/163",
                        },
                    },
                    {
                        "@type": "Offer",
                        priceSpecification: [
                            {
                                "@type": "UnitPriceSpecification",
                                price: "1452.34",
                                priceCurrency: "INR",
                            },
                            {
                                "@type": "UnitPriceSpecification",
                                priceType:
                                    "https://schema.org/SubscriptionPrice",
                                price: "1307.11",
                                priceCurrency: "INR",
                            },
                            {
                                "@type": "UnitPriceSpecification",
                                priceType: "https://schema.org/ListPrice",
                                price: "2030.98",
                                priceCurrency: "INR",
                            },
                        ],
                        availability: "http://schema.org/InStock",
                        url: "https://driffle.com/7-days-to-die-steam-cd-key-p470941?seller=648",
                        seller: {
                            "@type": "Organization",
                            name: "DigitalKeyStore",
                            url: "https://driffle.com/vendor/648",
                        },
                    },
                    {
                        "@type": "Offer",
                        priceSpecification: [
                            {
                                "@type": "UnitPriceSpecification",
                                price: "1525.66",
                                priceCurrency: "INR",
                            },
                            {
                                "@type": "UnitPriceSpecification",
                                priceType:
                                    "https://schema.org/SubscriptionPrice",
                                price: "1373.1",
                                priceCurrency: "INR",
                            },
                            {
                                "@type": "UnitPriceSpecification",
                                priceType: "https://schema.org/ListPrice",
                                price: "2030.98",
                                priceCurrency: "INR",
                            },
                        ],
                        availability: "http://schema.org/InStock",
                        url: "https://driffle.com/7-days-to-die-steam-cd-key-p470941?seller=1198",
                        seller: {
                            "@type": "Organization",
                            name: "Game Zone Portal",
                            url: "https://driffle.com/vendor/1198",
                        },
                    },
                ],
            },
            rating: { "@type": "Rating", worstRating: "1", bestRating: "5" },
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "5.0",
                reviewCount: 2,
            },
        },
        {
            "@context": "https://schema.org/",
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    item: {
                        name: "Home",
                        type: "WebPage",
                        "@id": "https://driffle.com",
                    },
                    position: 1,
                },
                {
                    "@type": "ListItem",
                    item: {
                        name: "Game",
                        type: "WebPage",
                        "@id": "/store/games",
                    },
                    position: 2,
                },
                {
                    "@type": "ListItem",
                    item: {
                        type: "WebPage",
                        name: "Steam",
                        "@id": "/store/steam",
                    },
                    position: 3,
                },
                {
                    "@type": "ListItem",
                    name: "7 Days to Die (Global) (PC / Mac / Linux) - Steam - Digital Key",
                    position: 4,
                },
            ],
        },
    ],
}

const exampleJsonLd2 = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "HRX by Hrithik Roshan Unisex Colourblocked Running Non-Marking Shoes",
    image: "https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/32085906/2024/12/25/c61e92aa-9d16-4fd7-8cad-c100cf3560351735143905559UnisexComfortableRunningShoes1.jpg",
    sku: "32085906",
    mpn: "32085906",
    description:
        "HRX by Hrithik Roshan Unisex Colourblocked Running Non-Marking Shoes",
    offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        availability: "InStock",
        price: "999",
        url: "https://www.myntra.com/sports-shoes/hrx+by+hrithik+roshan/hrx-by-hrithik-roshan-unisex-colourblocked-running-non-marking-shoes/32085906/buy",
    },
    brand: {
        "@type": "Thing",
        name: "HRX by Hrithik Roshan",
    },
}

async function main() {
    const expanded = await jsonld.expand(exampleJsonLd)
    console.log(expanded)
    const expanded2 = await jsonld.expand(exampleJsonLd2)
    console.log(expanded2)
}

main()
