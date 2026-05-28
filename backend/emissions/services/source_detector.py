class SourceDetector:

    @staticmethod
    def detect(headers):

        headers = [
            str(header).strip().lower()
            for header in headers
        ]
        # print(headers)
        # SAP
        if (
            "belnr" in headers or
            "menge" in headers
        ):
            return "SAP"

        # Utility
        if (
            "meterid" in headers or
            "consumption" in headers
        ):
            print("U")
            return "UTILITY"

        # Travel
        if (
            "bookingid" in headers or
            "travelclass" in headers
        ):
            return "TRAVEL"

        return "UNKNOWN"