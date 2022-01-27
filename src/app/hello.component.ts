import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { gantt } from 'dhtmlx-gantt';
import { GanttService } from './hello.service';

@Component({
  selector: 'hello',
  template: `<p>Test</p><div #gantt_here class='gantt-chart'></div>`,
  styleUrls: ['./hello.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HelloComponent implements OnInit, AfterViewInit {
  @ViewChild('gantt_here') ganttContainer: ElementRef;

  public presentationType = 'gantt_chart';

  constructor(private ganttService: GanttService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.ganttService.ganttInitialize();
      this.ganttService.date_view_configuration();
      this.ganttService.getResTaskPriority().subscribe((res) => {
        this.setResTaskPriority(res);
        this.getOperations();
      });
    }, 1000);
  }

  ngAfterViewInit() {
    gantt.createDatastore({
      name: gantt.config.resource_store,
      type: 'treeDatastore',
      initItem: function (item) {
        item.parent = null;
        item.open = false;
        return item;
      },
    });
    gantt.createDatastore({
      name: gantt.config.resource_store,
      type: 'treeDatastore',
      initItem: function (item) {
        item.parent = null;
        item.open = false;
        return item;
      },
    });
    gantt.init(this.ganttContainer.nativeElement);
  }

  setResTaskPriority(res: any) {
    if (res.resources != 'none') {
      let resourcesData: any[];
      let priorityData: any[];
      let wcData: any[];
      let woData: any[];
      let taskTypeData: any[];

      resourcesData = this.ganttService.getResources(
        res.Resources,
        res.Capacity
      );
      wcData = this.ganttService.getWorkCenters(res.Workcenters);
      woData = this.ganttService.getWorkOrders(res.WorkOrders);
      taskTypeData = this.ganttService.getTaskType(res.TaskType);
      priorityData = this.ganttService.getPriority();
      gantt.serverList('resource_data', res.Resources);
      gantt.serverList('task_type', res.TaskType);
      gantt.serverList('priority', priorityData);
      gantt.serverList('work_center', res.Workcenters);
      gantt.serverList('work_order', res.WorkOrders);
      gantt
        .getDatastore(gantt.config.resource_store)
        .attachEvent('onParse', function () {
          var people = [];
          gantt
            .getDatastore(gantt.config.resource_store)
            .eachItem(function (res) {
              if (
                !gantt
                  .getDatastore(gantt.config.resource_store)
                  .hasChild(res.id)
              ) {
                var copy = gantt.copy(res);
                copy.key = res.id;
                copy.label = res.text;
                people.push(copy);
              }
            });
          gantt.updateCollection('people', people);
        });
      gantt.getDatastore(gantt.config.resource_store).parse(resourcesData);
    }
  }

  getOperations() {
    this.ganttService.getOperations().subscribe((res: any) => {
      const list = this.ganttService.getPriorityList();

      //For Tasks
      let taskArray = null;
      let linksArray = null;
      if ((this.presentationType = 'gantt_chart')) {
        taskArray = this.ganttService.presentationTypeGanttChart(res.data);
      } else if ((this.presentationType = 'schedular')) {
        taskArray = this.ganttService.presentationTypeSchedular(res.data);
      }
      //For Tasks Links
      if ((this.presentationType = 'gantt_chart')) {
        linksArray = this.ganttService.presentationTypeGanttForLinks(res.links);
      }
      gantt.parse({
        data: taskArray,
        links: linksArray,
      });
    });
  }
}
