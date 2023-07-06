import { SkillEditor, AlternateSkillEditor } from "@self-learning/teaching";
import { Skills, convertNestedSkillsToArray } from '@self-learning/types';
import 'reactflow/dist/style.css';


export default function CreateSkillTree({
    onFinished
}: {
    onFinished: (skilltree: {name : string}) => void;
}) {

   // this ref stores the current dragged node
   const defaultTree: Skills = {
    id: "1",
    nestedSkills: [
        {
            id: "2",
            nestedSkills: [
                {
                    id: "3",
                    nestedSkills: [],
                    name: "test3",
                    level: 2,
                    description: "test3",
                },
                {
                    id: "4",
                    nestedSkills: [],
                    name: "test4",
                    level: 2,
                    description: "test4",
                }
            ],
            name: "test2",
            level: 1,
            description: "test2",
        },
        {
            id: "5",
            nestedSkills: [
                {
                    id: "6",
                    nestedSkills: [],
                    name: "test6",
                    level: 2,
                    description: "test6",
                },
                {
                    id: "7",
                    nestedSkills: [],
                    name: "test7",
                    level: 2,
                    description: "test7",
                }
            ],
            name: "test5",
            level: 1,
            description: "test5",
        }
    ],
    name: "test",
    level: 0,
    description: "test",
    };
    
    /*return(
       <div>
         <SkillEditor skilltree={defaultTree} onConfirm={onFinished} />
        </div>
    ); */
    
    return(
        <div>
            <AlternateSkillEditor skilltree={defaultTree} onConfirm={onFinished} />
        </div>
    ); 

}