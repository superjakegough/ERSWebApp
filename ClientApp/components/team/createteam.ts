﻿import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Team } from '../../models/team';
import { Employee } from '../../models/employee';
import { TeamMember } from '../../models/teammember';

@Component
export default class CreateTeamComponent extends Vue {	
	$refs!: {
		form: HTMLFormElement
	}

	rules: object = {
		required: (value: string) => !!value || 'Required',
		number: (value: string) => /^\d+(\d{1,2})?$/.test(value) || 'Value must be number e.g. "8" or "10"',
		decimal: (value: string) => /^\d+(\.\d{1,2})?$/.test(value) || 'Value must be decimal e.g. "8.0" or "7.5"'
	}

	team: Team = {
		id: 0,
		name: "",
		members: []
	}

	loading: boolean = false;
	failed: boolean = false;
	errorMessage: string = "";
	employees: Employee[] = [];
	svs: Employee[] = [];
	dris: Employee[] = [];
	ccas: Employee[] = [];
	rns: Employee[] = [];
	teamsvs: TeamMember[] = [];
	teamdris: TeamMember[] = [];
	teamccas: TeamMember[] = [];
	teamrns: TeamMember[] = [];

	mounted() {
		this.loading = true;
		fetch('api/Employee/GetEmployees')
			.then(response => response.json() as Promise<Employee[]>)
			.then(data => {
				this.employees = data;
				this.filterRoles();
				this.teamsvs.push(this.createTeamMember("SV"));
				this.teamdris.push(this.createTeamMember("DRI"));
				this.teamccas.push(this.createTeamMember("CCA"));
				this.teamrns.push(this.createTeamMember("RN"));
				this.loading = false;
			});
	}

	filterRoles() {
		for (var i = 0; i < this.employees.length; i++) {
			switch (this.employees[i].role) {
				case "SV":
					this.svs.push(this.employees[i]);
					break;
				case "DRI":
					this.dris.push(this.employees[i]);
					break;
				case "CCA":
					this.ccas.push(this.employees[i]);
					break;
				case "RN":
					this.rns.push(this.employees[i]);
					break;
			}
		}
	}

	createTeamMember(role: string) {
		var temp: TeamMember = {
			id: 0,
			teamId: 0,
			employeeId: 0,
			employeeName: "",
			employeeRole: role
		};
		return temp;
	}

	addSV() {
		if (this.teamsvs.length < 2) {
			this.teamsvs.push(this.createTeamMember("SV"));
		}
	}

	addDRI() {
		if (this.teamdris.length < 2) {
			this.teamdris.push(this.createTeamMember("DRI"));
		}
	}
	addCCA() {
		if (this.teamccas.length < 5) {
			this.teamccas.push(this.createTeamMember("CCA"));
		}
	}

	addRN() {
		if (this.teamrns.length < 5) {
			this.teamrns.push(this.createTeamMember("RN"));
		}
	}

	removeSV() {
		if (this.teamsvs.length > 1) {
			this.teamsvs.pop();
		}
	}

	removeDRI() {
		if (this.teamdris.length > 1) {
			this.teamdris.pop();
		}
	}

	removeCCA() {
		if (this.teamccas.length > 1) {
			this.teamccas.pop();
		}
	}

	removeRN() {
		if (this.teamrns.length > 1) {
			this.teamrns.pop();
		}
	}

	//Check for duplicates selected
	checkDuplicates() {
		this.failed = false;
		var duplicate: boolean = false;
		for (var i = 0; i < this.teamsvs.length - 1; i++) {
			if (this.teamsvs[i + 1].employeeId == this.teamsvs[i].employeeId) {
				this.failed = true;
				this.errorMessage = "Duplicate SV found!";
				duplicate = true;
				break;
			}
		}
		for (var i = 0; i < this.teamdris.length - 1; i++) {
			if (this.teamdris[i + 1].employeeId == this.teamdris[i].employeeId) {
				this.failed = true;
				this.errorMessage = "Duplicate DRI found!";
				duplicate = true;
				break;
			}
		}
		for (var i = 0; i < this.teamccas.length - 1; i++) {
			if (this.teamccas[i + 1].employeeId == this.teamccas[i].employeeId) {
				this.failed = true;
				this.errorMessage = "Duplicate CCA found!";
				duplicate = true;
				break;
			}
		}
		for (var i = 0; i < this.teamrns.length - 1; i++) {
			if (this.teamrns[i + 1].employeeId == this.teamrns[i].employeeId) {
				this.failed = true;
				this.errorMessage = "Duplicate RN found!";
				duplicate = true;
				break;
			}
		}
		return duplicate;
	}

	populateMembers() {
		for (var i = 0; i < this.teamsvs.length; i++) {
			if (this.teamsvs[i].employeeId > 0) {
				this.team.members.push(this.teamsvs[i]);
			}
		}
		for (var i = 0; i < this.teamdris.length; i++) {
			if (this.teamdris[i].employeeId > 0) {
				this.team.members.push(this.teamdris[i]);
			}
		}
		for (var i = 0; i < this.teamccas.length; i++) {
			if (this.teamccas[i].employeeId > 0) {
				this.team.members.push(this.teamccas[i]);
			}
		}
		for (var i = 0; i < this.teamrns.length; i++) {
			if (this.teamrns[i].employeeId > 0) {
				this.team.members.push(this.teamrns[i]);
			}
		}
	}

	createTeam() {
		this.failed = false;
		if (this.$refs.form.validate()) {
			if (!this.checkDuplicates()) {
				this.populateMembers();
				fetch('api/Team/Create', {
					method: 'POST',
					body: JSON.stringify(this.team)
				})
					.then(response => response.json() as Promise<number>)
					.then(data => {
						if (data < 1) {
							this.errorMessage = "Failed to create Team!";
							this.failed = true;
						} else {
							this.$router.push('/fetchteam');
						}
					})
			}
		}
	}

	clear() {
		this.teammanagers = [];
		this.teammanagers.push(this.createTeamMember("Manager"));
		this.teamsupervisors = [];
		this.teamsupervisors.push(this.createTeamMember("Supervisor"));
		this.teamagents = [];
		this.teamagents.push(this.createTeamMember("Agent"));
	}

	cancel() {
		this.$router.push('/fetchteam');
	}
}
