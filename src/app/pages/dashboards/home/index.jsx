import { Page } from "components/shared/Page";
import {Statistics} from "./Statistics/index.jsx";

export default function Home() {
    return (
        <Page title="Dashboard">
            <div className="transition-content overflow-hidden px-(--margin-x) pb-8">
                <Statistics />
            </div>
        </Page>
    );
}
