import { StateSchema, MessagesValue,  StateGraph, START, END, Annotation } from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
    query: Annotation({ type: String }),
    plan: Annotation({ type: String }),
    answer: Annotation({ type: String })
});

const planner = (state)=>{
    return{
        plan: "research the query",
    }
}

const responder = (state)=>{
    return{
        answer: `Answer of the query : ${state.query}`
    }
}


const graph = new StateGraph(StateAnnotation);

graph.addNode("planner", planner);
graph.addNode("responder", responder)
graph.addEdge(START, "planner");
graph.addEdge("planner", "responder");
graph.addEdge("responder", END);


const app = graph.compile();

const result = await app.invoke({
    query: "What is langraph"
})

console.log(result)

