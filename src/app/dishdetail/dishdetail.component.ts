import { Component, OnInit, ViewChild } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location , getLocaleDateFormat } from '@angular/common';
import { DishService } from '../services/dish.service';
import { Dish } from '../shared/dish';
import { switchMap } from 'rxjs/operators';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Comment } from '../shared/comment';
import { DISHES } from '../shared/dishes';
import { CommentStmt } from '@angular/compiler';
// const DISH = {
//   id: '0',
//   name: 'Uthappizza',
//   image: '/assets/images/uthappizza.png',
//   category: 'mains',
//   featured: true,
//   label: 'Hot',
//   price: '4.99',
//   // tslint:disable-next-line:max-line-length
//   description: 'A unique combination of Indian Uthappam (pancake) and Italian pizza, topped with Cerignola olives, ripe vine cherry tomatoes, Vidalia onion, Guntur chillies and Buffalo Paneer.',
//   comments: [
//        {
//            rating: 5,
//            comment: 'Imagine all the eatables, living in conFusion!',
//            author: 'John Lemon',
//            date: '2012-10-16T17:57:28.556094Z'
//        },
//        {
//            rating: 4,
//            comment: 'Sends anyone to heaven, I wish I could get my mother-in-law to eat it!',
//            author: 'Paul McVites',
//            date: '2014-09-05T17:57:28.556094Z'
//        },
//        {
//            rating: 3,
//            comment: 'Eat it, just eat it!',
//            author: 'Michael Jaikishan',
//            date: '2015-02-13T17:57:28.556094Z'
//        },
//        {
//            rating: 4,
//            comment: 'Ultimate, Reaching for the stars!',
//            author: 'Ringo Starry',
//            date: '2013-12-02T17:57:28.556094Z'
//        },
//        {
//         rating: 2,
//         comment: 'It\'s your birthday, we\'re gonna party!',
//         author: '25 Cent',
//         date: '2011-12-02T17:57:28.556094Z'
//     }
// ]
// };

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  

  commentForm: FormGroup;
  yourcomment: Comment;
  @ViewChild('cform') commentFormDirective;

  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
        'required': 'Name is required.',
        'minlength': 'Name must be at least 2 characters long.',
        'maxlength': 'Name cannot be more than 25 characters long.'
    },
    'comment': {
        'required': 'Comment is required.',
    },
  };

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder){
      this.createForm();
     }

     createForm() {
      this.commentForm = this.fb.group({
          rating: [5,[Validators.required]],
          comment: ['', [Validators.required]],
          author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      });

      this.commentForm.valueChanges
          .subscribe(data => this.onValueChanged(data));

      this.onValueChanged(); // (re)set validation messages now 
      }

    ngOnInit() {
      this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
    }
  
    setPrevNext(dishId: string) {
      const index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }

  goBack():void{
    this.location.back();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
        if (this.formErrors.hasOwnProperty(field)) {
            // clear previous error message (if any)
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    if (control.errors.hasOwnProperty(key)) {
                        this.formErrors[field] += messages[key] + ' ';
                    }
                }
            }
        }
    }

  }

  onSubmit() {
    //getDate
    var currentDate = new Date();
    var currentDateToString = currentDate.toISOString();;
  
    //map comment from Form to comments, adding date
    this.yourcomment = {
        rating: this.commentForm.value.rating,
        comment: this.commentForm.value.comment,
        author: this.commentForm.value.author,
        date: currentDateToString
    }

    //add new comment to the dish array of comments:
    this.dish.comments.push(this.yourcomment);
    
    //reset form values
    this.commentForm.reset({
        rating: '',
        comment: '',
        author: '',    
    });
    this.commentFormDirective.resetForm({rating: 5});
  }

}
