import { IRepository } from "../../../../../../model/hooks.model";

export default interface IProjectItemProps {
  type: string;
  projectName: string | null;
  latestDeployment: string | null;
  githubUrl: string | null;
  updateTime: string | null;
  repo: IRepository | null;
}
