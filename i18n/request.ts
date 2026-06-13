import { getRequestConfig } from "next-intl/server";

import messages from "@/messages/fr.json";

export default getRequestConfig(async () => {
  return {
    locale: "fr",
    messages,
  };
});
