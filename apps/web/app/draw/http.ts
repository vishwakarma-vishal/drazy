import axios from "axios";
import { BaseShape } from "./shapes/BaseShape";
import { Rectangle } from "./shapes/Rectangle";
import { Line } from "./shapes/Line";
import { Pen } from "./shapes/Pen";
import { Ellipse } from "./shapes/Ellipse";
import { Arrow } from "./shapes/Arrow";

export const getContent = async (roomId: string) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.HTTP_BACKEND_URL}/room/${roomId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = response.data.content;

        let shapes: BaseShape[] = [];

        shapes = data.map((item: any) => {
            if (item.rectangle) {
                const prop = item.rectangle;
                return new Rectangle(prop.startX, prop.startY, prop.width, prop.height, prop.color);
            }
            else if (item.ellipse) {
                const prop = item.ellipse;
                return new Ellipse(prop.startX, prop.startY, prop.radiusX, prop.radiusY, prop.color);
            }
            else if (item.line) {
                const prop = item.line;
                return new Line(prop.startX, prop.startY, prop.endX, prop.endY, prop.color);
            }
            else if (item.arrow) {
                const prop = item.arrow;
                return new Arrow(prop.startX, prop.startY, prop.endX, prop.endY, prop.color);
            }
            // for pen (stroke)
            else if (item.stroke) {
                const prop = item.stroke;
                return new Pen(JSON.parse(prop.points), prop.color);
            } else {
                console.log("Unknown shape received, skipping -> ", item);
            }
        });

        console.log("Response-> ", response);

        return shapes;
    } catch (error) {
        console.log("error", error);
        return [];
    }
}
