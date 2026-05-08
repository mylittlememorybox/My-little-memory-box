import type { Metadata } from “next”;
import “./globals.css”;

export const metadata: Metadata = {
title: “My Little Memory Box | Ψηφιακά Λευκώματα Αναμνήσεων”,
description:
“Δημιούργησε το δικό σου ψηφιακό λεύκωμα αναμνήσεων γεμάτο φωτογραφίες και λόγια αγάπης.”,
metadataBase: new URL(“https://mylittlememorybox.gr”),
openGraph: {
title: “My Little Memory Box”,
description:
“Ψηφιακά λευκώματα αναμνήσεων για τις πιο σημαντικές στιγμές της ζωής σου.”,
locale: “el_GR”,
type: “website”,
},
icons: {
icon: “/favicon.ico”,
},
};

export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<html lang="el">
<head>
<meta charSet="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>{children}</body>
</html>
);
}
