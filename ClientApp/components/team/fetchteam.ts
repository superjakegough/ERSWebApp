import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Team } from '../../models/team';
import { TeamMember } from '../../models/teammember';

@Component
export default class FetchTeamComponent extends Vue {
	teams: Team[] = [];
	date: string = "";
	loading: boolean = false;
	search: string = "";
	failed: boolean = false;
	dialog: boolean = false;
	selected: number = 0;
	headers: object[] = [
		{ text: 'Name', value: 'name' }
	];

	mounted() {
		this.loadTeams();
	}

	displayNames(members: TeamMember[], role: string) {
		let names: string[] = [];
		for (var i = 0; i < members.length; i++) {
			if (members[i].employeeRole === role) {
				names.push(members[i].employeeName);
			}
		}
		return names.join(", ");
	}

	loadTeams() {
		this.loading = true;
		fetch('api/Team/GetTeams')
			.then(response => response.json() as Promise<Team[]>)
			.then(data => {
				this.teams = data;
				this.loadRoles();
			});
	}

	loadRoles() {
		fetch('api/Admin/GetRoleNames')
			.then(response => response.json() as Promise<string[]>)
			.then(data => {
				for (var i = 0; i < data.length; i++) {
					this.headers.push({ text: data[i], value: data[i] });
				}
				this.loading = false;
			})
	}

	createTeam() {
		this.$router.push("/createteam");
	}

	editTeam(id: number) {
		this.$router.push("/editteam/" + id);
	}

	viewTeam(id: number) {
		this.$router.push("/viewteam/" + id);
	}

	openDelete(selected: number) {
		this.selected = selected;
		this.dialog = true;
	}

	deleteTeam() {
		this.failed = false;
		this.dialog = false;
		fetch('api/Team/Delete?id=' + this.selected, {
			method: 'DELETE'
		})
			.then(response => response.json() as Promise<number>)
			.then(data => {
				if (data < 1) {
					this.failed = true;
				} else {
					this.loadTeams();
				}
			})
	}
}
