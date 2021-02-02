import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, concatMap, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { TicketService } from '../../_services';
import { serializeError } from '../../_utils/serialize-error';
import * as featureActions from './actions';
import { selectTicketForId } from './selectors';
import { State } from './state';

@Injectable()
export class TicketStoreEffects {
  constructor(
    private actions$: Actions,
    private ticketService: TicketService,
    private store: Store<State>
  ) {}

  @Effect()
  loadTicketsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LoadTicketsAction>(
      featureActions.ActionTypes.LOAD_TICKETS
    ),
    switchMap(() =>
      this.ticketService.tickets().pipe(
        map(
          tickets =>
            new featureActions.LoadTicketsSuccessAction({
              tickets
            })
        ),
        catchError(error =>
          observableOf(
            new featureActions.LoadTicketsFailureAction({
              error: serializeError(error).message
            })
          )
        )
      )
    )
  );

  @Effect()
  addTicketEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AddTicketAction>(
      featureActions.ActionTypes.ADD_TICKET
    ),
    map(action => action.payload),
    concatMap(({ newTicket }) =>
      this.ticketService.newTicket(newTicket).pipe(
        map(
          ticket =>
            new featureActions.AddTicketSuccessAction({
              ticket
            })
        ),
        catchError(error =>
          observableOf(
            new featureActions.AddTicketFailureAction({
              error: serializeError(error).message
            })
          )
        )
      )
    )
  );

  @Effect()
  assignTicketEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AssignTicketAction>(
      featureActions.ActionTypes.ASSIGN_TICKET
    ),
    map(action => action.payload),
    concatMap(({ ticketId, userId }) =>
      this.ticketService.assign(ticketId, userId).pipe(
        map(
          assignedTicket =>
            new featureActions.AssignTicketSuccessAction({
              ticket: { changes: assignedTicket, id: assignedTicket.id }
            })
        ),
        catchError(error =>
          observableOf(
            new featureActions.AssignTicketFailureAction({
              error: serializeError(error).message
            })
          )
        )
      )
    )
  );

  @Effect()
  completeTicketEffect$ = this.actions$.pipe(
    ofType<featureActions.CompleteTicketAction>(
      featureActions.ActionTypes.COMPLETE_TICKET
    ),
    map(action => action.payload), 
    concatMap(({ ticketId, originalStatus }) => {
        console.log('made it here', ticketId, originalStatus);
        // console.log('103',{ticket});
          return this.ticketService.complete(ticketId, true).pipe(
            catchError(error => {
              console.log('made it here as well');
            // console.log({...ticket, completed: originalStatus });
              return observableOf(
                new featureActions.CompleteTicketFailureAction({
                  error: serializeError(error).message, ticketId,  originalStatus
                })
              );
            }
            )
          );

      }   
    )
  );
}
