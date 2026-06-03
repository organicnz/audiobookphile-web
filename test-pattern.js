const routeProgress = new URLPattern({ pathname: "*/progress*" })
const url = "https://iambzzclljayqdxkeepy.supabase.co/functions/v1/api/api/items/123?expanded=1&include=progress"
console.log(routeProgress.test(url))
