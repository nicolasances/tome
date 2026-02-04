import { TotoAPI } from "./TotoAPI";

export class GaleBrokerAPI {


    /**
     * Posts a new task to be executed by an Gale Agent.
     * 
     * @param taskId the task id
     * @param taskInputData the input data needed by the task
     * @returns 
     */
    async postTask(taskId: string, taskInputData: any): Promise<any> {

        return (await new TotoAPI().fetch('gale-broker', `/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                command: { command: "start" },
                taskId: taskId,
                taskInputData: taskInputData
            })
        })).json()
    }
}