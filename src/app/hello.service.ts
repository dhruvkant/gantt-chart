import { Injectable } from '@angular/core';
import { gantt } from 'dhtmlx-gantt';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';
import { hardCodedOperationData, hardCodedResoucesData } from './data';

@Injectable({
  providedIn: 'root',
})
export class GanttService {
  token = {
    // GetData: JSON.stringify([{
    CompanyDBID: sessionStorage.selectedComp,
    GUID: sessionStorage.getItem('GUID'),
    UsernameForLic: sessionStorage.getItem('loggedInUser'),
    // }])
  };

  private datatableKeyMapperFn = (res: any) =>
    res.hasOwnProperty('DATATABLE') && res.DATATABLE && res.DATATABLE.length
      ? res.DATATABLE
      : [];
  private resPriorityList: any[] = [];
  private resourceDataStore: any;

  constructor(private httpclient: HttpClient) {}

  ganttInitialize() {
    // gantt.config.sort = true;
    // gantt.config.min_duration = 1000*60;
    // gantt.config.duration_unit = "minute";
    // gantt.config.duration_step = 1;
    // gantt.config.work_time = true;
    // gantt.config.duration_unit = 'day';
    // gantt.config.work_time = true;
    // 	gantt.config.min_column_width = 60;
    // 	gantt.config.duration_unit = "day";
    // 	gantt.config.scale_height = 20 * 3;
    // 	gantt.config.row_height = 30;

    gantt.config.resource_store = 'resources';
    gantt.config.resource_property = 'res_id';
    // gantt.config.resize_rows = true;

    // gantt.config.inherit_calendar = true;
    // gantt.config.time_step = 1;
    // gantt.config.step = 0.1;
    // gantt.config.min_column_width = system_settings['task_column_width'];
    // gantt.config.scale_height = system_settings['chart_header_scale_height'];
    // gantt.config.grid_width = system_settings['left_panel_width'];
    // gantt.config.row_height = system_settings['chart_table_row_height'];
    // gantt.config.grid_resize = system_settings['left_panel_resize'];
    // gantt.config.drag_lightbox = system_settings['drag_lightbox'];
    // gantt.config.lightbox_additional_height = system_settings['lightbox_additional_height'];

    // gantt.config.min_column_width = 30;
    // gantt.config.scale_height = 30;
    // gantt.config.grid_width = 580;
    // gantt.config.row_height = 30;
    // gantt.config.grid_resize = true;
    // gantt.config.keep_grid_width = true;
    // gantt.config.drag_lightbox = true;
    // gantt.config.lightbox_additional_height = 120;

    // gantt.config.lightbox['project_sections'] = '';
    // gantt.config.auto_scheduling = true;
    // gantt.config.auto_scheduling_strict = true;
    // gantt.config.auto_scheduling_compatibility = true;
    // gantt.config.details_on_create = true;
    // gantt.config.drag_move = true;
    // gantt.config.drag_drop = true;
    // gantt.config.order_branch = true;
    // gantt.config.order_branch_free = false;
    // gantt.config.open_tree_initially = true;
    // gantt.config.touch = "force";
    // gantt.config.readonly = true;
    // gantt.config.rtl = true;
    // gantt.config.work_time = true; // removes non-working time from calculations
    // gantt.config.skip_off_time = true; // hides non-working time in the chart
    // gantt.config.api_date = "%d-%m-%Y %H:%i";
    gantt.config.process_resource_assignments = true;
    // gantt.config.autofit = true;
    // gantt.config.undo = true;
    // gantt.config.redo = true;
    // gantt.config.undo_types = {
    //   link: 'link',
    //   task: 'task',
    // };
    // gantt.config.undo_steps = 10;
    gantt.plugins({
      auto_scheduling: true,
      undo: true,
      grouping: true,
    });

    var res_rec: any;
    var str_separator: any;

    function calculate_resource_period_consumption(
      start_date,
      end_date,
      tasks,
      resourceMode
    ) {
      let curr_task_dur = 0;
      var task_count = 0;

      tasks.forEach(function (task) {
        const task_start_date = task.start_date;
        const task_end_date = task.end_date;
        var cal_from_datetime = start_date;
        var cal_to_datetime = end_date;

        //console.log("TSD " + task_start_date + " TED " + task_end_date  + " SSD " + start_date + " SED " + end_date);

        if (
          task_start_date < end_date &&
          task_end_date > start_date &&
          task.progress < 100
        ) {
          if (resourceMode == 'hours') {
            if (start_date < task_start_date) {
              cal_from_datetime = task_start_date;
            }

            if (task_end_date < end_date) {
              cal_to_datetime = task_end_date;
            }

            curr_task_dur += gantt.calculateDuration({
              start_date: cal_from_datetime,
              end_date: cal_to_datetime,
              task: task,
            });
            //console.log("task_id " + task.id + " cal_from_datetime " + cal_from_datetime + " cal_to_datetime " + cal_to_datetime + " curr_task_dur " + curr_task_dur);
          } else {
            task_count = task_count + 1;
          }
        }
      });

      if (resourceMode == 'hours') {
        curr_task_dur = Math.round((curr_task_dur * 100) / 60) / 100; // convert minutes to hours
        return curr_task_dur;
      } else {
        return task_count;
      }
    }

    // gantt.templates.resource_cell_class = function (start_date, end_date, resource, tasks) {
    //   var css = [];
    //   css.push("resource_marker");

    //   var tasks = getResourceTasks(resource.id, resource.work_center_id);
    //   if (tasks.length > 0) {
    //     var reqd_period_cap = 0;
    //     var period_capacity = 0;
    //     var resourceMode = "hours";
    //     var res_workdate = "";
    //     var str_start_date = "";
    //     var time_duration_unit = gantt.config.duration_unit;
    //     var dur_unit_to_hrs = 1;

    //     if (time_duration_unit == 'minute') {
    //       dur_unit_to_hrs = 60;
    //     } else if (time_duration_unit == 'hour') {
    //       dur_unit_to_hrs = 1;
    //     }

    //     if (sessionStorage.getItem('default_timeline_view') == "day") {
    //       var calendarId = resource['CAL_ID'];
    //       //console.log("calendarId " + calendarId + " resource.work_center_id " + resource.work_center_id  + " resource.key " + resource.key);
    //       if (calendarId > 0) {
    //         var calendar = gantt.getCalendar(calendarId);
    //         period_capacity = calendar.calculateDuration(start_date, end_date);
    //       }
    //       period_capacity = Math.round((period_capacity / dur_unit_to_hrs) * 100) / 100;
    //     } else {
    //       var res_cap_arr = resource['resource_capacity'];
    //       var res_rec: any;
    //       var int_start_date: any;
    //       for (let i = 0; i < res_cap_arr.length; i++) {
    //         res_rec = res_cap_arr[i];
    //         res_workdate = res_rec.workdate.replaceAll(str_separator, "");
    //         int_start_date = get_date_concat_from_date_YYYYMMDD(start_date);

    //         if (int_start_date == res_workdate) {
    //           period_capacity = res_rec.avail_capacity;
    //           break;
    //         }
    //       };
    //     }

    //     reqd_period_cap = calculate_resource_period_consumption(start_date, end_date, tasks, resourceMode);
    //     //console.log("period_capacity " + period_capacity + " reqd_period_cap " + reqd_period_cap + " start date " + start_date + " end date " + end_date);
    //     if (reqd_period_cap > 0) {
    //       if (period_capacity >= reqd_period_cap) {
    //         css.push("workday_ok");
    //       } else {
    //         css.push("workday_over");
    //       }
    //     }
    //   }
    //   return css.join(" ");
    // };

    gantt.config.scales = [
      { unit: 'month', step: 1, format: '%F, %Y' },
      { unit: 'week', step: 1 /*, format: weekScaleTemplate */ },
      {
        unit: 'day',
        step: 1,
        format: '%d %M' /*,format: "%D", css:daysStyle*/,
      },
    ];

    gantt.config.columns = this.left_matrix_configuration();

    function getResourceTasks(resourceId, resource_wc) {
      var res = [];
      if (resourceId == 0) {
        return res;
      }

      var state = gantt.getState();
      const state_min_date = state.min_date;
      var maxDate = new Date(
        state_min_date.getFullYear(),
        state_min_date.getMonth(),
        state_min_date.getDate() + 1,
        0,
        0,
        0
      );
      var tasks;

      tasks = gantt.getTaskByTime(state_min_date, maxDate);
      // res = gantt.getTaskBy(gantt.config.resource_property, resourceId);

      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].resource_id == resourceId) {
          res.push(tasks[i]);
        }
      }
      return res;
    }

    function calculateResourcePeriodConsumption(
      start_date,
      end_date,
      tasks,
      resourceMode
    ) {
      let curr_task_dur = 0;
      var task_count = 0;

      tasks.forEach(function (task) {
        const task_start_date = task.start_date;
        const task_end_date = task.end_date;
        var cal_from_datetime = start_date;
        var cal_to_datetime = end_date;

        //console.log("TSD " + task_start_date + " TED " + task_end_date  + " SSD " + start_date + " SED " + end_date);

        if (
          task_start_date < end_date &&
          task_end_date > start_date &&
          task.progress < 100
        ) {
          if (resourceMode == 'hours') {
            if (start_date < task_start_date) {
              cal_from_datetime = task_start_date;
            }

            if (task_end_date < end_date) {
              cal_to_datetime = task_end_date;
            }

            curr_task_dur += gantt.calculateDuration({
              start_date: cal_from_datetime,
              end_date: cal_to_datetime,
              task: task,
            });
            //console.log("task_id " + task.id + " cal_from_datetime " + cal_from_datetime + " cal_to_datetime " + cal_to_datetime + " curr_task_dur " + curr_task_dur);
          } else {
            task_count = task_count + 1;
          }
        }
      });

      if (resourceMode == 'hours') {
        curr_task_dur = Math.round((curr_task_dur * 100) / 60) / 100; // convert minutes to hours
        return curr_task_dur;
      } else {
        return task_count;
      }
    }

    function getResourcesCapacityByTimelineView(
      resource,
      start_date,
      end_date
    ) {
      return '8';
      var res_cap_arr = resource['resource_capacity'];
      var res_capacity = 0;
      var int_workdate = '';
      var gantt_to_db_date_format = '%Y-%m-%d';
      var current_timeline_view = sessionStorage.getItem(
        'default_timeline_view'
      );
      var int_start_date = get_date_concat_from_date_YYYYMMDD(start_date);
      var int_end_date = get_date_concat_from_date_YYYYMMDD(end_date);
      var res_cap = res_cap_arr.filter(function (obj) {
        return obj.id == resource.id;
      });

      if (res_cap.length > 0) {
        for (let i = 0; i < res_cap.length; i++) {
          res_rec = res_cap[i];
          int_workdate = res_rec.workdate;
          int_workdate = get_date_from_string(
            res_rec.workdate,
            gantt_to_db_date_format
          );
          int_workdate = get_date_concat_from_date_YYYYMMDD(int_workdate);
          //console.log("res_rec.workdate " + int_workdate + " " + int_start_date + " " + int_end_date);
          if (
            int_start_date == int_workdate ||
            (int_start_date <= int_workdate && int_workdate <= int_end_date)
          ) {
            if (current_timeline_view == 'day') {
              return res_rec.avail_capacity;
            } else if (current_timeline_view == 'week') {
              console.log('res_rec.capacity ' + res_rec.week_capacity);
              return res_rec.week_capacity;
            } else if (current_timeline_view == 'month') {
              return res_rec.month_capacity;
            } else if (current_timeline_view == 'year') {
              return res_rec.year_capacity;
            }
          }
          break;
        }
      }
      return res_capacity;
    }

    function get_date_concat_from_date_YYYYMMDD(date_to_convert) {
      const const_date_concat_YYYYMMDD = '%Y%m%d';
      return get_date_string(date_to_convert, const_date_concat_YYYYMMDD);
    }

    function get_date_from_string(date_to_convert, datetime_format) {
      if (datetime_format == null) {
        datetime_format = gantt.config.date_format;
      }
      var formatFunc = gantt.date.str_to_date(datetime_format);
      var date = formatFunc(date_to_convert);
      return date;
    }

    function get_date_string(date_to_convert, datetime_format) {
      if (datetime_format == null) {
        datetime_format = gantt.config.date_format;
      }
      var formatFunc = gantt.date.date_to_str(datetime_format);
      var date_str = formatFunc(date_to_convert);
      return date_str;
    }

    gantt.templates.resource_cell_class = function (
      start_date,
      end_date,
      resource,
      tasks
    ) {
      var css = [];
      css.push('resource_marker');
      if (tasks.length <= 1) {
        css.push('workday_ok');
      } else {
        css.push('workday_over');
      }
      return css.join(' ');
      // var css = [];
      // css.push('resource_marker');

      // var tasks = getResourceTasks(resource.id, resource.work_center_id);
      // if (tasks.length > 0) {
      //   var reqd_period_cap = 0;
      //   var period_capacity = 0;
      //   var resourceMode = 'hours';
      //   var res_workdate = '';
      //   var str_start_date = '';
      //   var time_duration_unit = gantt.config.duration_unit;
      //   var dur_unit_to_hrs = 1;

      //   if (time_duration_unit == 'minute') {
      //     dur_unit_to_hrs = 60;
      //   } else if (time_duration_unit == 'hour') {
      //     dur_unit_to_hrs = 1;
      //   }

      //   if (sessionStorage.getItem('default_timeline_view') == 'day') {
      //     var calendarId = resource['CAL_ID'];
      //     //console.log("calendarId " + calendarId + " resource.work_center_id " + resource.work_center_id  + " resource.key " + resource.key);
      //     if (calendarId > 0) {
      //       var calendar = gantt.getCalendar(calendarId);
      //       period_capacity = calendar.calculateDuration(start_date, end_date);
      //     }
      //     period_capacity =
      //       Math.round((period_capacity / dur_unit_to_hrs) * 100) / 100;
      //   } else {
      //     var res_cap_arr = resource['resource_capacity'];
      //     var int_start_date: any;
      //     for (let i = 0; i < res_cap_arr.length; i++) {
      //       res_rec = res_cap_arr[i];
      //       res_workdate = res_rec.workdate.replaceAll(str_separator, '');
      //       var int_start_date = get_date_concat_from_date_YYYYMMDD(start_date);

      //       if (int_start_date == res_workdate) {
      //         period_capacity = res_rec.avail_capacity;
      //         break;
      //       }
      //     }
      //   }

      //   reqd_period_cap = calculate_resource_period_consumption(
      //     start_date,
      //     end_date,
      //     tasks,
      //     resourceMode
      //   );
      //   //console.log("period_capacity " + period_capacity + " reqd_period_cap " + reqd_period_cap + " start date " + start_date + " end date " + end_date);
      //   if (reqd_period_cap > 0) {
      //     if (period_capacity >= reqd_period_cap) {
      //       css.push('workday_ok');
      //     } else {
      //       css.push('workday_over');
      //     }
      //   }
      // }
      // return css.join(' ');
    };

    gantt.templates.resource_cell_value = function (
      start_date,
      end_date,
      resource,
      tasks
    ) {
      return '<div>' + tasks.length * 8 + '</div>';
      var html = '<div style="margin: -10px; border-radius: 50px; ">';
      var tasks = getResourceTasks(resource.id, resource.work_center_id);
      var resourceMode = 'hours';
      html += calculate_resource_period_consumption(
        start_date,
        end_date,
        tasks,
        resourceMode
      );
      html += '</div>';

      return html;
    };

    var resourceGridConfig = {
      scale_height: 30,
      subscales: [],
      columns: [
        {
          name: 'work_center',
          label: 'Work Center',
          width: '*',
          resize: true,
          template: function (resource) {
            return resource.work_center_id;
          },
        },
        {
          name: 'resource',
          label: 'Resources',
          width: '*',
          resize: true,
          template: function (resource) {
            return resource.resource_name;
          },
        },
        {
          name: 'workload',
          label: 'Workload',
          width: '*',
          resize: true,
          align: 'center',
          template: function (resource) {
            var tasks = getResourceTasks(resource.id, resource.work_center_id);
            var totalDuration = 0;
            var resourceMode = 'hours';
            //console.log("resource.key :" + resource.id + " tasks lg " + tasks.length);
            totalDuration = calculateResourcePeriodConsumption(
              gantt.config.start_date,
              gantt.config.end_date,
              tasks,
              resourceMode
            );
            return (totalDuration || 0) + ' h';
          },
        },

        {
          name: 'capacity',
          label: 'Capacity',
          width: '*',
          resize: true,
          align: 'center',
          template: function (resource) {
            var available_capacity = 0;
            available_capacity = getResourcesCapacityByTimelineView(
              resource,
              gantt.config.start_date,
              gantt.config.end_date
            );
            //console.log("available_capacity " + available_capacity);
            return available_capacity + ' h';
          },
        },
      ],
    };

    gantt.config.layout = {
      css: 'gantt_container',
      rows: [
        {
          // the default layout
          gravity: 2,
          cols: [
            {
              view: 'grid',
              group: 'grids',
              scrollY: 'scrollVer',
            },
            { resizer: true, width: 1 },
            {
              view: 'timeline',
              scrollX: 'scrollHor',
              scrollY: 'scrollVer',
            },
            { view: 'scrollbar', id: 'scrollVer', group: 'vertical' },
          ],
        },
        { resizer: true, width: 1, next: 'resource_grid' },
        {
          height: 30,
          cols: [
            { html: '', group: 'grids' },
            { resizer: true, width: 1 },
            {
              html:
                "<div class='d-flex ml-2 h-100 align-items-center'><label class='active d-flex align-items-center mb-0 mr-1' >Hours per day <input checked type='radio' class='resource_radio_change ml-1' name='resource-mode' value='hours'></label>" +
                "<label class='d-flex align-items-center mb-0'>Tasks per day <input type='radio' name='resource-mode' class='resource_radio_change ml-1' value='tasks'></label></div>",
              css: 'resource-controls',
            },
          ],
        },
        {
          // a custom layout
          gravity: 1,
          id: 'resource_grid',
          config: resourceGridConfig,
          cols: [
            {
              view: 'resourceGrid',
              group: 'grids',
              bind: 'resources',
              scrollY: 'resourceVScroll',
            },
            { resizer: true, width: 1 },
            {
              view: 'resourceTimeline',
              scrollX: 'scrollHor',
              bind: 'resources',
              scrollY: 'resourceVScroll',
            },
            { view: 'scrollbar', id: 'resourceVScroll', group: 'vertical' },
          ],
        },
        { view: 'scrollbar', id: 'scrollHor' },
      ],
    };
  }

  getOperations(): Observable<any> {
    return of(hardCodedOperationData);
  }

  presentationTypeGanttChart(tasks) {
    var tasksArray = [];
    var readonly: any;
    if (tasks['readonly'] == 'true') {
      readonly = 1;
    } else {
      readonly = 0;
    }

    tasks.forEach((task) => {
      tasksArray.push({
        id: task['id'],
        ref_id: parseInt(task['ref_id']),
        task_type: task['task_type'],
        type: task['operation_type'],
        work_center: task['work_center_id'],
        start_date: new Date(task['start_date']),
        end_date: new Date(task['end_date']),
        work_order:
          task['operation_type'] == 'task'
            ? task['work_order_id']
            : parseInt('0'),
        operation_number: task['operation_number'],
        status: task['status'] ? task['status'] : parseInt('0'),
        head_doc_entry: parseInt(task['head_doc_entry']),
        oper_doc_entry: parseInt(task['oper_doc_entry']),
        oper_line_id: parseInt(task['oper_line_id']),
        res_line_id: parseInt(task['res_line_id']),
        is_saved: parseInt('1'),
        resource_id: parseInt(task['res_id']),
        required_resource: task['required_resource'].trim,
        text: task['operation_code'],
        priority: task['priority'],
        resource_name: task['resource_name'],
        progress: parseFloat(task['progress']),
        parent: parseInt(task['parent']),
        duration1: task['duration1'],
        duration: task['duration'],
        min_duration: task['min_duration'],
        description: task['description'],
        is_local_task: parseInt(task['is_local_task']),
        split_task_grp_id: parseInt(task['split_task_grp_id']),
        readonly: Boolean(readonly),
        open: Boolean(1),
      });
    });
    console.log(tasksArray[0]);
    return tasksArray;
  }

  presentationTypeSchedular(tasks) {
    var tasksArray = [];
    tasks.forEach((task) => {
      var strLower = task['text'].toLowerCase();
      tasksArray.push({
        id: task['id'],
        text: strLower.slice(0, 1).toUpperCase() + strLower.slice(1),
        start_date: task['start_date'],
        end_date: task['end_date'],
        section_id: task['resource_id'],
        open: 'true',
        is_saved: 1,
      });
    });
    return tasksArray;
  }

  presentationTypeGanttForLinks(links) {
    var linksArray = [];
    links.forEach((link) => {
      linksArray.push({
        id: 'link-' + link['id'],
        ref_id: link['ref_id'],
        is_saved: 1,
        source: link['source'],
        target: link['target'],
        type: 0,
        link_id: link['id'],
        head_doc_entry: link['head_doc_entry'],
      });
    });
    return linksArray;
  }

  getResTaskPriority(): Observable<any> {
    return of(hardCodedResoucesData);
  }

  getResources(res, cap) {
    let output = [];
    let resCap = [];
    var set_date_format =
      sessionStorage.getItem('set_date_format') &&
      sessionStorage.getItem('set_date_format') != ''
        ? set_date_format
        : 'Y-m-d';
    cap.forEach((capacity) => {
      let data = {
        id: capacity['id'].toString(),
        workdate: moment(capacity['workdate']).format('YYYY-MM-DD'),
        avail_capacity: parseFloat(capacity['avail_capacity']).toString(),
        week: capacity['WK'],
        week_capacity: parseFloat(capacity['week_capacity']).toString(),
        month: capacity['MTH'],
        month_capacity: parseFloat(capacity['mth_capacity']).toString(),
        year: capacity['YR'].toString(),
        year_capacity: parseFloat(capacity['yr_capacity']).toString(),
      };
      output.push(data);
    });

    res.forEach((resource) => {
      let data = {
        id: resource['id'],
        work_center_id: resource['work_center_id'],
        key: resource['RESOURCE_ID'],
        label: resource['work_center_id'] + ' - ' + resource['name'],
        resource_name: resource['name'],
        avail_capacity: 0,
        CAL_ID: resource['CAL_ID'].toString(),
        resource_capacity: output,
      };
      resCap.push(data);
    });

    return resCap;
    // return resCapArray.push({ "data": resCap });
  }

  getTaskType(taskType) {
    let output = [];
    let taskTypeArray = [];
    taskType.forEach((task) => {
      let data = {
        key: parseInt(task['code']),
        label: task['description'],
        unique_name: task['key'],
      };
      output.push(data);
    });
    return output;
    // return taskTypeArray.push({ "data": output });
  }

  getPriority() {
    let priorityList = this.getPriorityList();
    let output = [];
    let priorityArray = [];
    priorityList.forEach((priority) => {
      let data = {
        key: priority['description'],
        label: priority['description'],
        min_value: priority['min_value'],
        max_value: priority['max_value'],
        range: priority['range'],
      };
      output.push(data);
    });
    return output;
    // return priorityArray.push({ "data": output });
  }

  getWorkCenters(wc) {
    console.log('getting workcenters');
    let output = [];
    let wcArray = [];
    wc.forEach((workCenter) => {
      let wcObject = {
        key: workCenter['id'],
        label: workCenter['name'],
      };
      output.push(wcObject);
    });
    return output;
    // return wcArray.push({ "data": output });
  }

  getWorkOrders(wo) {
    console.log('getting workorders');
    let output = [];
    let woArray = [];
    wo.forEach((workOrder) => {
      let woObject = {
        key: workOrder['work_order_number'],
        label: workOrder['work_order_number'],
      };
      output.push(woObject);
    });
    return output;
    // return woArray.push({ "data": output });
  }

  getPriorityList() {
    return this.resPriorityList;
  }

  left_matrix_configuration() {
    let left_matrix = [
      {
        name: 'text',
        label: 'Task',
        resize: true,
        width: 200,
        template: function (obj) {
          return obj.text;
        },
        tree: true,
      },
      {
        name: 'work_center',
        label: 'Work Center',
        resize: true,
        width: '90',
        template: function (obj) {
          return obj.work_center;
        },
      },
      {
        name: 'resource',
        label: 'Resource',
        resize: true,
        align: 'center',
        width: '*',
        template: function (obj) {
          return obj.resource_name;
        },
      },
      {
        name: 'assign_resource',
        label: 'Assign Resources',
        resize: true,
        align: 'center',
        width: '30',
        template: function (obj) {
          return obj.required_resource;
        },
      },
      {
        name: 'priority',
        label: 'Priority',
        resize: true,
        align: 'center',
        width: '30',
        template: function (obj) {
          return 'Low';
        },
      },
      {
        name: 'start_date',
        label: 'Start Time',
        align: 'center',
        resize: true,
        template: function (obj) {
          return obj.start_date;
        },
      },
      {
        name: 'req_hour',
        label: 'Req Hours',
        resize: true,
        align: 'center',
        width: '30',
        template: function (obj) {
          return obj.min_duration;
        },
      },
      {
        name: 'duration',
        label: 'Hours',
        resize: true,
        align: 'center',
        width: '30',
        template: function (obj) {
          return obj.duration;
        },
      },
      { name: 'add', label: '' },
    ];
    return left_matrix;
  }

  date_view_configuration() {
    let start = this.get_start_date('day');
    // let start = new Date();
    start.setHours(0);
    let end = new Date(start);
    // var $end = new Date();
    end.setHours(23, 59);
    gantt.config.start_date = gantt.date.day_start(start);
    gantt.config.end_date = end; // new Date(2017, 9, 31, 24, 00);
    // get_resources_by_time("day", gantt.config.start_date);
    //  gantt.config.date_grid = "%F %d";
    gantt.config.scale_unit = 'hour';
    gantt.config.date_scale = '%H:%i';
    gantt.config.step = 1;
    var dateScaleTemplate = function (date) {
      var dateToStr = gantt.date.date_to_str('%F %d, %Y');
      return dateToStr(gantt.config.start_date);
    };
    gantt.config.duration_unit = 'hour';
    gantt.config.subscales = [
      { unit: 'day', step: 1, template: dateScaleTemplate },
    ];
    // set_select_date(gantt.config.start_date); // for set date in input select date
    this.enable_disable_project_drag(true);
  }

  week_view_configuration(curr_date = null) {
    let start = this.get_start_date('week');
    let end = this.get_end_of_week(start);
    // if(curr_date){
    //   start = curr_date;
    //   end = get_end_of_week(curr_date);
    // }
    // let start = get_start_of_week(new Date());
    start.setHours(0);
    end.setHours(23, 59);
    gantt.config.start_date = gantt.date.day_start(start);
    gantt.config.end_date = end; // new Date(2017, 9, 31, 24, 00);
    // gantt.config.date_grid = "%H:%i";
    gantt.config.scale_unit = 'day';
    // gantt.config.date_scale = "%l, %F %d";
    gantt.config.date_scale = '%l';
    gantt.config.step = 1;
    var weekScaleTemplate = function (date) {
      var dateToStr = gantt.date.date_to_str('%d %M');
      var dateToStrY = gantt.date.date_to_str('%Y');
      return (
        dateToStr(gantt.config.start_date) +
        ' - ' +
        dateToStr(gantt.config.end_date) +
        ', ' +
        dateToStrY(gantt.config.end_date)
      );
    };
    gantt.config.duration_unit = 'day';
    gantt.config.subscales = [
      { unit: 'week', step: 1, template: weekScaleTemplate },
    ];
    // set_select_date(gantt.config.start_date);
    this.enable_disable_project_drag(true);
  }

  month_view_configuration() {
    // let date = get_start_date('month');
    let date = new Date();
    let start = new Date(date.getFullYear(), date.getMonth(), 1);
    let end = new Date(date.getFullYear(), date.getMonth() + 1);
    gantt.config.start_date = gantt.date.day_start(start);
    gantt.config.end_date = end; // new Date(2017, 9, 31, 24, 00);
    gantt.config.scale_unit = 'day';
    gantt.config.date_scale = '%d %M';
    gantt.config.step = 1;
    var monthScaleTemplate = function (date) {
      var dateToStr = gantt.date.date_to_str('%F, %Y');
      return dateToStr(gantt.config.start_date);
    };
    gantt.config.duration_unit = 'day';
    gantt.config.subscales = [
      { unit: 'month', step: 1, template: monthScaleTemplate },
    ];
    // set_select_date(gantt.config.start_date);
    this.enable_disable_project_drag(true);
  }

  get_start_date(mode_type) {
    return new Date('2022-01-21T00:00:00');
    let current_plan_details = {
      from_date: '',
    };
    let start;
    if (mode_type == 'day' || mode_type == 'month' || mode_type == 'year') {
      if (current_plan_details.from_date) {
        start = new Date(current_plan_details['from_date']);
      } else {
        start = new Date();
      }
    } else if (mode_type == 'week') {
      if (current_plan_details.from_date) {
        start = this.get_start_of_week(
          new Date(current_plan_details['from_date'])
        );
      } else {
        start = this.get_start_of_week(new Date());
      }
    }
    return start;
  }

  get_start_of_week(date) {
    date = date ? new Date(+date) : new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1 - date.getDay());

    // date.setDate(date.getDate() - 6);// used for to_date
    // console.log("week --", date);
    return date;
  }

  get_end_of_week(date) {
    date = this.get_start_of_week(date);
    date.setDate(date.getDate() + 6); // used for from_date
    // date.setDate(date.getDate());// used for to_date
    return date;
  }

  enable_disable_project_drag(flag) {
    gantt.config.drag_project = flag;
    gantt.config.auto_scheduling_move_projects = false;
    gantt.config.auto_scheduling_strict = flag;
    gantt.config.fit_tasks = flag;
  }

  change_select_date(curr_date) {
    //get the selected data and hours to build the db queries accordingly.
    const d = new Date(curr_date);
    // var current_value = new Date(d.getTime() + one_day_in_ms);
    const current_value = new Date(d.getTime());
    var tomorrow_start = new Date(current_value);
    var tomorrow_end = new Date(current_value);
    tomorrow_start.setHours(0);
    tomorrow_end.setHours(23, 59);
    gantt.config.start_date = gantt.date.day_start(tomorrow_start);
    gantt.config.end_date = tomorrow_end; // new Date(2017, 9, 31, 24, 00);
    // console.log( gantt.config.start_date);
    // this.set_select_date(gantt.config.start_date);
    // this.get_resources_by_time("day", gantt.config.start_date);
    gantt.render();
  }

  change_week(type, curr_date = null) {
    const current = gantt.config.end_date;
    var start_week;
    var end_week;
    if (type == 'next') {
      start_week = this.get_start_of_week(current);
      end_week = this.get_end_of_week(start_week);
    } else if (type == 'prev') {
      var temp = new Date(gantt.config.start_date);
      temp.setDate(temp.getDate() - 7);
      start_week = this.get_start_of_week(temp);
      end_week = this.get_end_of_week(start_week);
    } else if (curr_date) {
      var today = new Date(curr_date);
      start_week = this.get_start_of_week(today);
      end_week = this.get_end_of_week(today);
    }
    start_week.setHours(0);
    end_week.setHours(23, 59);
    gantt.config.start_date = gantt.date.day_start(start_week);
    gantt.config.end_date = end_week; // new Date(2017, 9, 31, 24, 00);
    // this.set_select_date(gantt.config.start_date);
    gantt.render();
  }

  change_month(type, curr_date = null) {
    var current_month = gantt.config.start_date;
    var new_month_value;
    if (type == 'next') {
      new_month_value = current_month.getMonth() + 1;
    } else if (type == 'prev') {
      new_month_value = current_month.getMonth() - 1;
    } else if (type == 'current') {
      const temp = new Date();
      current_month = temp;
      new_month_value = temp.getMonth();
    } else if (curr_date) {
      const temp = new Date(curr_date);
      current_month = temp;
      new_month_value = temp.getMonth();
    }
    const start_month = new Date(
      current_month.getFullYear(),
      new_month_value,
      1
    );
    const end_month = new Date(
      current_month.getFullYear(),
      new_month_value + 1
    );
    gantt.config.start_date = gantt.date.day_start(start_month);
    gantt.config.end_date = end_month; // new Date(2017, 9, 31, 24, 00);
    // this.set_select_date(gantt.config.start_date);
    gantt.render();
  }

  change_year(type, curr_date = null) {
    var current_year = gantt.config.start_date;
    var new_year_value;
    if (type == 'next') {
      new_year_value = new Date(
        new Date().setFullYear(current_year.getFullYear() + 1)
      ).getFullYear();
    } else if (type == 'prev') {
      new_year_value = new Date(
        new Date().setFullYear(current_year.getFullYear() - 1)
      ).getFullYear();
    } else if (type == 'current') {
      new_year_value = current_year.getFullYear();
    } else if (curr_date) {
      var current_year = new Date(curr_date);
      new_year_value = current_year.getFullYear();
    }
    const start = new Date(new_year_value, 0, 1);
    const end = new Date(new_year_value, 11, 31);
    gantt.config.start_date = gantt.date.day_start(start);
    gantt.config.end_date = end; // new Date(2017, 9, 31, 24, 00);
    gantt.render();
  }

  convertDateToGanttDateFormat(date: Date) {
    const ganttDateFormat = 'DD-MM-YYYY HH:mm';
    return moment(date).format(ganttDateFormat);
  }
}
